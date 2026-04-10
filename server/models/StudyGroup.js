const mongoose = require('mongoose');
const studyGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  subject: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxMembers: { type: Number, default: 10 },
  tags: [{ type: String }],
  schedule: { type: String, default: '' },
  meetLink: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  isPublic: { type: Boolean, default: true },
  department: { type: String, default: '' },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });
module.exports = mongoose.model('StudyGroup', studyGroupSchema);
