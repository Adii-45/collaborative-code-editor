import Project from '../models/Project.js';

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
        { collaborators: req.user._id },
      ],
    })
      .populate('owner', 'username email')
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
      .populate('collaborators', 'username email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Authorization check: only owner or collaborators can access
    const isOwner = project.owner._id.toString() === req.user._id.toString();
    const isCollaborator = project.collaborators.some(
      c => c._id.toString() === req.user._id.toString()
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

    // Authorization check
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isCollaborator = project.collaborators.some(
      c => c.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: 'Not authorized to modify this project' });
    }

    // Update and mark as modified (Mixed type requires this)
    project.fileTree = fileTree;
    project.markModified('fileTree');
    await project.save();

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
 * @route   POST /api/projects/:id/collaborators
 * @desc    Add a collaborator by email
 * @access  Private (owner only)
 */
export const addCollaborator = async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can add collaborators' });
    }

    // Find user by email
    const { default: User } = await import('../models/User.js');
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with that email' });
    }

    // Check if already a collaborator
    if (project.collaborators.includes(user._id)) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    // Cannot add self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You are already the owner' });
    }

    project.collaborators.push(user._id);
    await project.save();

    res.json({ message: `${user.username} added as collaborator` });
  } catch (error) {
    res.status(500).json({ message: 'Error adding collaborator' });
  }
};
