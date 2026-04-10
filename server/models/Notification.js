const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['session_request','session_confirmed','session_cancelled','verification_approved','verification_rejected','forum_reply','event_reminder','job_posted','study_group_invite','achievement_earned','mention'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  meta: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });
module.exports = mongoose.model('Notification', notificationSchema);
