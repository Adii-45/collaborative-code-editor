import Project from '../models/Project.js';

/**
 * @route   POST /api/invite/:token
 * @desc    Accept an invite link
 * @access  Private
 */
export const acceptInvite = async (req, res) => {
  try {
    const { token } = req.params;

    // Find a project that has this token in its inviteLinks
    const project = await Project.findOne({ 'inviteLinks.token': token });

    if (!project) {
      return res.status(404).json({ message: 'Invalid or expired invite link' });
    }

    // Find the specific invite link object
    const inviteLink = project.inviteLinks.find(link => link.token === token);

    // Check expiry
    if (new Date() > new Date(inviteLink.expiresAt)) {
      // Clean up expired token
      project.inviteLinks = project.inviteLinks.filter(link => link.token !== token);
      await project.save();
      return res.status(400).json({ message: 'This invite link has expired' });
    }

    // Check if user is already a collaborator
    const isAlreadyCollaborator = project.collaborators.some(
      c => c.user.toString() === req.user._id.toString()
    );

    if (isAlreadyCollaborator) {
      // Optionally clean up token if it's meant to be single-use, 
      // but standard shareable links are usually multi-use until expiry.
      // We'll leave the token as is since it's a shareable link.
      return res.status(200).json({ 
        message: 'You are already a collaborator', 
        projectId: project._id 
      });
    }

    // Add user as collaborator with the role specified in the invite
    project.collaborators.push({
      user: req.user._id,
      role: inviteLink.role
    });

    await project.save();

    res.status(200).json({ 
      message: 'Successfully joined project', 
      projectId: project._id 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error processing invite' });
  }
};
