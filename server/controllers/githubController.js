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
 * @route   POST /api/github/connect
 * @desc    Exchange OAuth code for GitHub access token
 * @access  Private
 */
export const connectGitHub = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'GitHub OAuth code required' });

    // In a real app, these come from process.env
    // We will use them if they exist, otherwise error out asking the user to configure them
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({ message: 'GitHub OAuth is not configured on the server (.env)' });
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
 * @route   POST /api/github/import
 * @desc    Import a repository into a specific project
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

    // Format repo URL with auth token for cloning private repos
    // E.g., https://github.com/user/repo.git -> https://<token>@github.com/user/repo.git
    let authUrl = repoUrl;
    if (repoUrl.startsWith('https://github.com/')) {
      authUrl = repoUrl.replace('https://github.com/', `https://${user.githubAccessToken}@github.com/`);
    }

    const localPath = path.join(REPOS_DIR, projectId);

    // Clean up existing directory if it exists
    try {
      await fs.rm(localPath, { recursive: true, force: true });
    } catch (e) { /* ignore */ }

    // Clone the repo
    const git = simpleGit();
    await git.clone(authUrl, localPath);

    // Read the cloned directory into our JSON fileTree structure
    const fileTree = await buildTreeFromDisk(localPath);

    // Update project
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
    
    // Check if dir exists
    try {
      await fs.access(localPath);
    } catch (e) {
      return res.status(400).json({ message: 'Local repository missing. Please re-import.' });
    }

    const git = simpleGit(localPath);

    // Configure user for this repo
    await git.addConfig('user.name', user.githubUsername || user.username);
    await git.addConfig('user.email', user.email);

    // Add, Commit, Push
    await git.add('.');
    await git.commit(message);

    // Ensure remote has the token
    let pushUrl = project.githubRepoUrl;
    if (pushUrl.startsWith('https://github.com/')) {
      pushUrl = pushUrl.replace('https://github.com/', `https://${user.githubAccessToken}@github.com/`);
    }

    // Set remote and push
    await git.removeRemote('origin').catch(() => {});
    await git.addRemote('origin', pushUrl);
    await git.push('origin', 'main', ['--force']); // Assume main branch for Phase 1 or we could push to current branch

    res.json({ message: 'Changes pushed successfully' });
  } catch (error) {
    console.error('Commit & Push Error:', error);
    res.status(500).json({ message: 'Failed to commit and push changes' });
  }
};
