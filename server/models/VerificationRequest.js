const mongoose = require('mongoose');

const verificationRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  role: { type: String, enum: ['student', 'alumni'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  
  // Student docs
  collegeIdUrl: { type: String, default: '' },
  collegeIdPublicId: { type: String, default: '' },
  
  // Alumni docs
  degreeUrl: { type: String, default: '' },
  degreePublicId: { type: String, default: '' },
  offerLetterUrl: { type: String, default: '' },
  offerLetterPublicId: { type: String, default: '' },
  
  // Admin review
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewNote: { type: String, default: '' },
  reviewedAt: { type: Date },
  
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('VerificationRequest', verificationRequestSchema);
