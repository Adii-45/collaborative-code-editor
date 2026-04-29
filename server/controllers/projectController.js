import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import Project from '../models/Project.js';
import { syncTreeToDisk } from '../utils/fsUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPOS_DIR = path.join(__dirname, '..', 'repos');

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private
 */
export const createProject = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    // Check for duplicate project name for this user
    const existing = await Project.findOne({ owner: req.user._id, name });
    if (existing) {
      return res.status(400).json({ message: 'You already have a project with this name' });
    }

    const project = await Project.create({
      name,
      owner: req.user._id,
      // pre-save hook will automatically add owner to collaborators
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error creating project' });
  }
};

/**
 * @route   GET /api/projects
 * @desc    Get all projects for the current user (owned + collaborating)
 * @access  Private
 */
export const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id },
      ],
    })
      .populate('owner', 'username email')
      .populate('collaborators.user', 'username email')
      .sort({ updatedAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects' });
  }
};

/**
 * @route   GET /api/projects/:id
 * @desc    Get a single project by ID (only if user is owner or collaborator)
 * @access  Private
 */
export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'username email')
      .populate('collaborators.user', 'username email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Authorization check: only owner or collaborators can access
    const isOwner = project.owner._id.toString() === req.user._id.toString();
    const isCollaborator = project.collaborators.some(
      c => c.user._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: 'Not authorized to access this project' });
    }

    res.json(project);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(500).json({ message: 'Error fetching project' });
  }
};

/**
 * @route   PUT /api/projects/:id/tree
 * @desc    Update the file tree for a project
 * @access  Private
 */
export const updateFileTree = async (req, res) => {
  try {
    const { fileTree } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Authorization check: owner or editor role required to update tree
    // Find the user's role
    const collab = project.collaborators.find(c => c.user.toString() === req.user._id.toString());
    const isOwner = project.owner.toString() === req.user._id.toString();
    
    if (!isOwner && (!collab || collab.role === 'viewer')) {
      return res.status(403).json({ message: 'Not authorized to modify this project' });
    }

    // Update and mark as modified (Mixed type requires this)
    project.fileTree = fileTree;
    project.markModified('fileTree');
    await project.save();

    // If GitHub linked, sync to disk
    if (project.isGithubLinked) {
      const localPath = path.join(REPOS_DIR, project._id.toString());
      await syncTreeToDisk(fileTree, localPath).catch(err => {
        console.error('Failed to sync to disk:', err);
      });
    }

    res.json({ message: 'File tree updated', fileTree: project.fileTree });
  } catch (error) {
    res.status(500).json({ message: 'Error updating file tree' });
  }
};

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project (owner only)
 * @access  Private
 */
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can delete this project' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project' });
  }
};

/**
 * @route   PUT /api/projects/:id
 * @desc    Rename a project (owner only)
 * @access  Private
 */
export const renameProject = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can rename this project' });
    }

    // Check for duplicate name
    const existing = await Project.findOne({ owner: req.user._id, name: name.trim() });
    if (existing && existing._id.toString() !== project._id.toString()) {
      return res.status(400).json({ message: 'You already have a project with this name' });
    }

    project.name = name.trim();
    await project.save();

    res.json({ message: 'Project renamed', project });
  } catch (error) {
    res.status(500).json({ message: 'Error renaming project' });
  }
};

/**
 * @route   POST /api/projects/:id/invite-email
 * @desc    Add a collaborator by email
 * @access  Private (owner or editor)
 */
export const inviteEmail = async (req, res) => {
  try {
    const { email, role = 'editor' } = req.body;
    
    if (!['editor', 'viewer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Auth check: Only owners and editors can invite
    const isOwner = project.owner.toString() === req.user._id.toString();
    const collab = project.collaborators.find(c => c.user.toString() === req.user._id.toString());
    
    if (!isOwner && (!collab || collab.role === 'viewer')) {
      return res.status(403).json({ message: 'Only owners and editors can invite collaborators' });
    }

    // Find user by email
    const { default: User } = await import('../models/User.js');
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with that email' });
    }

    // Check if already a collaborator
    const existingCollab = project.collaborators.find(c => c.user.toString() === user._id.toString());
    if (existingCollab) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    project.collaborators.push({ user: user._id, role });
    await project.save();

    // In a real app, send email here via nodemailer

    res.json({ message: `${user.username} invited as ${role}` });
  } catch (error) {
    res.status(500).json({ message: 'Error adding collaborator' });
  }
};

/**
 * @route   POST /api/projects/:id/invite-link
 * @desc    Generate a shareable invite link
 * @access  Private (owner or editor)
 */
export const inviteLink = async (req, res) => {
  try {
    const { role = 'editor' } = req.body;
    
    if (!['editor', 'viewer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Auth check: Only owners and editors can invite
    const isOwner = project.owner.toString() === req.user._id.toString();
    const collab = project.collaborators.find(c => c.user.toString() === req.user._id.toString());
    
    if (!isOwner && (!collab || collab.role === 'viewer')) {
      return res.status(403).json({ message: 'Only owners and editors can generate invite links' });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    project.inviteLinks.push({ token, role, expiresAt });
    await project.save();

    res.json({ token, expiresAt, role });
  } catch (error) {
    res.status(500).json({ message: 'Error generating invite link' });
  }
};
