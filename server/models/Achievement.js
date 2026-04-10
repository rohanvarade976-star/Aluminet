const mongoose = require('mongoose');
const achievementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['first_login','profile_complete','first_session','five_sessions','verified','first_post','helpful_member','mentor_of_month','event_host','study_leader'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: '🏆' },
  points: { type: Number, default: 10 },
  earnedAt: { type: Date, default: Date.now },
}, { timestamps: true });
module.exports = mongoose.model('Achievement', achievementSchema);
