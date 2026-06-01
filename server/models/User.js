import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User model for authentication.
 * Passwords are automatically hashed before saving via a pre-save hook.
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [
      function() { return !this.isGithubUser; },
      'Password is required'
    ],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Never return password in queries by default
  },
  avatar: {
    type: String,
    default: '',
  },
  githubId: {
    type: String,
    sparse: true, // Allow multiple nulls/undefined but unique if present
  },
  isGithubUser: {
    type: Boolean,
    default: false,
  },
  githubUsername: {
    type: String,
    trim: true,
  },
  githubAccessToken: {
    type: String,
    select: false, // Keep it secure
  },
  workspaceName: {
    type: String,
    trim: true,
  },
  workspaceDescription: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
});

/**
 * Pre-save hook: Hash password before storing it in the database.
 * Only runs when the password field has been modified.
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Instance method: Compare a candidate password against the stored hash.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
