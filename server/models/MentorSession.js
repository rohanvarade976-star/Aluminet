const mongoose = require('mongoose');

const mentorSessionSchema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, default: 60 }, // minutes
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  meetLink: { type: String, default: '' },
  notes: { type: String, default: '' },
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String, default: '' },
  tags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('MentorSession', mentorSessionSchema);
