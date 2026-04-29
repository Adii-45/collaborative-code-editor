import mongoose from 'mongoose';

/**
 * Project model.
 * Stores the entire file tree as a nested JSON object (Mixed type)
 * to preserve the frontend's tree structure without a separate File collection.
 * This approach keeps reads fast (single document) and matches the frontend state shape.
 */
const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters'],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'editor', 'viewer'],
      default: 'editor',
    }
  }],
  inviteLinks: [{
    token: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['editor', 'viewer'],
      default: 'editor',
    },
    expiresAt: {
      type: Date,
      required: true,
    }
  }],
  isGithubLinked: {
    type: Boolean,
    default: false,
  },
  githubRepoUrl: {
    type: String,
  },
  /**
   * fileTree stores the nested file/folder structure as-is from the frontend.
   * Shape: { id: "root", name: "root", type: "folder", children: [...] }
   */
  fileTree: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      id: 'root',
      name: 'root',
      type: 'folder',
      children: [],
    },
  },
}, {
  timestamps: true,
});

// Pre-save hook to ensure owner is in collaborators
projectSchema.pre('save', function(next) {
  if (this.isNew) {
    const ownerExists = this.collaborators.some(c => c.user.toString() === this.owner.toString());
    if (!ownerExists) {
      this.collaborators.push({ user: this.owner, role: 'owner' });
    }
  }
  next();
});

// Compound index: a user cannot have two projects with the same name
projectSchema.index({ owner: 1, name: 1 }, { unique: true });

const Project = mongoose.model('Project', projectSchema);
export default Project;
