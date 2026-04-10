const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student', 'alumni', 'admin'], default: 'student' },
  avatar: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  verificationStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
  isActive: { type: Boolean, default: true },
  isFlagged: { type: Boolean, default: false },
  fraudScore: { type: Number, default: 0 },
  department: { type: String, default: '' },
  graduationYear: { type: Number },
  bio: { type: String, default: '', maxlength: 500 },
  skills: [{ type: String }],
  interests: [{ type: String }],
  linkedIn: { type: String, default: '' },
  github: { type: String, default: '' },
  currentCompany: { type: String, default: '' },
  currentRole: { type: String, default: '' },
  location: { type: String, default: '' },
  refreshToken: { type: String, default: '' },
  emailVerifyToken: { type: String },
  emailVerifyExpires: { type: Date },
  lastLogin: { type: Date },
  loginCount: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  coverPhoto: { type: String, default: '' },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.emailVerifyToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
// Note: points field added in v4 - run seed to update existing users
