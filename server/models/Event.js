const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['webinar', 'talk', 'workshop', 'networking', 'other'], default: 'webinar' },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  speakers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, default: 60 },
  meetLink: { type: String, default: '' },
  banner: { type: String, default: '' },
  tags: [{ type: String }],
  maxAttendees: { type: Number, default: 100 },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPublished: { type: Boolean, default: false },
  status: { type: String, enum: ['upcoming', 'live', 'completed', 'cancelled'], default: 'upcoming' },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
