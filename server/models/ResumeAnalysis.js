const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resumeUrl: { type: String, required: true },
  resumeText: { type: String, default: '' },
  analysis: {
    overallScore: { type: Number, default: 0 },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    suggestions: [{ type: String }],
    missingSkills: [{ type: String }],
    recommendedRoles: [{ type: String }],
    summary: { type: String, default: '' },
  },
  rawResponse: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
