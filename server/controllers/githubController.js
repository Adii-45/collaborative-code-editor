import axios from 'axios';
import simpleGit from 'simple-git';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { buildTreeFromDisk } from '../utils/fsUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure repos directory exists
const REPOS_DIR = path.join(__dirname, '..', 'repos');
fs.mkdir(REPOS_DIR, { recursive: true }).catch(console.error);

/**
 * Validate that a URL is a valid GitHub repository URL.
 * Accepts: https://github.com/user/repo or https://github.com/user/repo.git
 * Returns { owner, repo } or null.
 */
const parseGitHubUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const match = url.trim().match(/^https:\/\/github\.com\/([^/]+)\/([^/.]+)(\.git)?$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
};

/**
 * @route   POST /api/github/connect
 * @desc    Exchange OAuth code for GitHub access token
 * @access  Private
 */
export const connectGitHub = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'GitHub OAuth code required' });

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({ message: 'GitHub OAuth is not configured on the server. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to .env' });
    }

    // Exchange code for token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }, {
      headers: { Accept: 'application/json' }
    });

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      return res.status(400).json({ message: 'Failed to retrieve access token from GitHub' });
    }

    // Get user details
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const githubUsername = userResponse.data.login;

    // Save to user model
    const user = await User.findById(req.user._id);
    user.githubUsername = githubUsername;
    user.githubAccessToken = accessToken;
    await user.save();

    res.json({ message: 'GitHub connected successfully', githubUsername });
  } catch (error) {
    console.error('GitHub Connect Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to connect GitHub account' });
  }
};

/**
 * @route   GET /api/github/repos
 * @desc    Fetch the authenticated user's GitHub repos
 * @access  Private
 */
export const fetchUserRepos = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+githubAccessToken');
    if (!user.githubAccessToken) {
      return res.status(401).json({ message: 'Please connect your GitHub account first' });
    }

    const response = await axios.get('https://api.github.com/user/repos', {
      headers: { Authorization: `Bearer ${user.githubAccessToken}` },
      params: { per_page: 100, sort: 'updated' }
    });

    const repos = response.data.map(r => ({
      name: r.name,
      fullName: r.full_name,
      url: r.html_url,
      private: r.private,
      description: r.description,
      language: r.language,
      updatedAt: r.updated_at,
    }));

    res.json(repos);
  } catch (error) {
    console.error('Fetch Repos Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch repositories' });
  }
};

/**
 * @route   POST /api/github/import-url
 * @desc    Import a public GitHub repo by URL — auto-creates a new project
 * @access  Private
 */
export const importRepoByUrl = async (req, res) => {
  try {
    const { repoUrl } = req.body;

    // 1. Validate URL
    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      return res.status(400).json({ message: 'Invalid GitHub URL. Use format: https://github.com/user/repo' });
    }

    // 2. Create a new project named after the repo
    const projectName = parsed.repo;
    let project;
    try {
      project = new Project({
        name: projectName,
        owner: req.user._id,
      });
      await project.save();
    } catch (err) {
      // Duplicate name — append a short suffix
      if (err.code === 11000) {
        const suffix = Date.now().toString(36).slice(-4);
        project = new Project({
          name: `${projectName}-${suffix}`,
          owner: req.user._id,
        });
        await project.save();
      } else {
        throw err;
      }
    }

    const localPath = path.join(REPOS_DIR, project._id.toString());

    // 3. Clean up directory if it exists
    try {
      await fs.rm(localPath, { recursive: true, force: true });
    } catch { /* ignore */ }

    // 4. Attempt clone — try public first, then with auth token for private repos
    let cloneUrl = repoUrl.endsWith('.git') ? repoUrl : `${repoUrl}.git`;
    const git = simpleGit({ timeout: { block: 60000 } }); // 60s timeout

    try {
      await git.clone(cloneUrl, localPath);
    } catch (publicCloneError) {
      // Public clone failed — try with auth token if the user has one
      const user = await User.findById(req.user._id).select('+githubAccessToken');
      if (user.githubAccessToken) {
        const authUrl = cloneUrl.replace('https://github.com/', `https://${user.githubAccessToken}@github.com/`);
        try {
          await git.clone(authUrl, localPath);
        } catch (authCloneError) {
          // Both failed — clean up and return error
          await Project.findByIdAndDelete(project._id);
          try { await fs.rm(localPath, { recursive: true, force: true }); } catch { /* ignore */ }
          return res.status(400).json({
            message: 'Failed to clone repository. It may be private, not found, or the URL is incorrect.'
          });
        }
      } else {
        // No auth token and public clone failed
        await Project.findByIdAndDelete(project._id);
        try { await fs.rm(localPath, { recursive: true, force: true }); } catch { /* ignore */ }
        return res.status(400).json({
          message: 'Repository not found or is private. Connect your GitHub account to import private repos.'
        });
      }
    }

    // 5. Build fileTree from cloned files
    const fileTree = await buildTreeFromDisk(localPath);

    // 6. Save to project
    project.fileTree = fileTree;
    project.githubRepoUrl = repoUrl;
    project.isGithubLinked = true;
    project.markModified('fileTree');
    await project.save();

    console.log(`[GitHub] Imported ${repoUrl} → project ${project._id}`);

    res.json({
      message: 'Repository imported successfully!',
      projectId: project._id,
      projectName: project.name,
    });
  } catch (error) {
    console.error('Import Repo Error:', error);
    res.status(500).json({ message: 'Failed to import repository. Please try again.' });
  }
};

/**
 * @route   POST /api/github/import
 * @desc    Import a repository into an EXISTING project (legacy)
 * @access  Private
 */
export const importRepo = async (req, res) => {
  try {
    const { projectId, repoUrl } = req.body;

    if (!projectId || !repoUrl) {
      return res.status(400).json({ message: 'Project ID and Repository URL are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Authorization check
    const isOwner = project.owner.toString() === req.user._id.toString();
    const collab = project.collaborators.find(c => c.user.toString() === req.user._id.toString());
    if (!isOwner && (!collab || collab.role === 'viewer')) {
      return res.status(403).json({ message: 'Not authorized to import repos into this project' });
    }

    const user = await User.findById(req.user._id).select('+githubAccessToken');
    if (!user.githubAccessToken) {
      return res.status(401).json({ message: 'Please connect your GitHub account first' });
    }

    let authUrl = repoUrl;
    if (repoUrl.startsWith('https://github.com/')) {
      authUrl = repoUrl.replace('https://github.com/', `https://${user.githubAccessToken}@github.com/`);
    }

    const localPath = path.join(REPOS_DIR, projectId);

    try {
      await fs.rm(localPath, { recursive: true, force: true });
    } catch (e) { /* ignore */ }

    const git = simpleGit();
    await git.clone(authUrl, localPath);

    const fileTree = await buildTreeFromDisk(localPath);

    project.fileTree = fileTree;
    project.githubRepoUrl = repoUrl;
    project.isGithubLinked = true;
    project.markModified('fileTree');
    await project.save();

    res.json({ message: 'Repository imported successfully', project });
  } catch (error) {
    console.error('Import Repo Error:', error);
    res.status(500).json({ message: 'Failed to import repository' });
  }
};

/**
 * @route   POST /api/github/commit
 * @desc    Commit and push changes to GitHub
 * @access  Private
 */
export const commitAndPush = async (req, res) => {
  try {
    const { projectId, message } = req.body;

    if (!projectId || !message) {
      return res.status(400).json({ message: 'Project ID and commit message are required' });
    }

    const project = await Project.findById(projectId);
    if (!project || !project.isGithubLinked) {
      return res.status(404).json({ message: 'Project not found or not linked to GitHub' });
    }

    const user = await User.findById(req.user._id).select('+githubAccessToken githubUsername email');
    if (!user.githubAccessToken) {
      return res.status(401).json({ message: 'Please connect your GitHub account first' });
    }

    const localPath = path.join(REPOS_DIR, projectId);
    
    try {
      await fs.access(localPath);
    } catch (e) {
      return res.status(400).json({ message: 'Local repository missing. Please re-import.' });
    }

    const git = simpleGit(localPath);

    await git.addConfig('user.name', user.githubUsername || user.username);
    await git.addConfig('user.email', user.email);

    await git.add('.');
    await git.commit(message);

    let pushUrl = project.githubRepoUrl;
    if (pushUrl.startsWith('https://github.com/')) {
      pushUrl = pushUrl.replace('https://github.com/', `https://${user.githubAccessToken}@github.com/`);
    }

    await git.removeRemote('origin').catch(() => {});
    await git.addRemote('origin', pushUrl);
    await git.push('origin', 'main', ['--force']);

    res.json({ message: 'Changes pushed successfully' });
  } catch (error) {
    console.error('Commit & Push Error:', error);
    res.status(500).json({ message: 'Failed to commit and push changes' });
  }
};
