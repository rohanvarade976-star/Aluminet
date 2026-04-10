const mongoose = require('mongoose');
const jobPostingSchema = new mongoose.Schema({
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, default: 'Remote' },
  type: { type: String, enum: ['full-time','part-time','internship','contract','freelance'], default: 'full-time' },
  description: { type: String, required: true },
  requirements: [{ type: String }],
  skills: [{ type: String }],
  salary: { type: String, default: '' },
  applyLink: { type: String, default: '' },
  applyEmail: { type: String, default: '' },
  deadline: { type: Date },
  isActive: { type: Boolean, default: true },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  saved: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  experienceLevel: { type: String, enum: ['fresher','junior','mid','senior'], default: 'fresher' },
  department: { type: String, default: '' },
}, { timestamps: true });
module.exports = mongoose.model('JobPosting', jobPostingSchema);
