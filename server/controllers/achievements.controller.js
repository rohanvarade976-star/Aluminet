const Achievement = require('../models/Achievement');
const User = require('../models/User');
const { createNotification } = require('./notification.controller');

const ACHIEVEMENT_DEFS = {
  first_login:      { title: 'First Steps',       description: 'Logged into AlumiNet for the first time', icon: '👋', points: 10 },
  profile_complete: { title: 'Profile Pro',        description: 'Completed your profile with all details', icon: '✨', points: 25 },
  first_session:    { title: 'First Session',      description: 'Booked your first mentorship session',   icon: '🎯', points: 30 },
  five_sessions:    { title: 'Mentorship Seeker',  description: 'Completed 5 mentorship sessions',        icon: '🏆', points: 100 },
  verified:         { title: 'Verified Member',    description: 'Got your account verified by admin',     icon: '✅', points: 50 },
  first_post:       { title: 'Forum Voice',        description: 'Posted your first forum discussion',     icon: '💬', points: 20 },
  helpful_member:   { title: 'Helpful Member',     description: 'Received 10 upvotes on your posts',     icon: '⭐', points: 75 },
  event_host:       { title: 'Event Host',         description: 'Hosted your first webinar or talk',     icon: '🎤', points: 60 },
  study_leader:     { title: 'Study Leader',       description: 'Created a study group with 5+ members', icon: '📚', points: 40 },
};

exports.awardAchievement = async (userId, type, io) => {
  try {
    const existing = await Achievement.findOne({ user: userId, type });
    if (existing) return null;
    const def = ACHIEVEMENT_DEFS[type];
    if (!def) return null;
    const achievement = await Achievement.create({ user: userId, type, ...def });
    await User.findByIdAndUpdate(userId, { $inc: { points: def.points } });
    await createNotification({
      recipient: userId, type: 'achievement_earned',
      title: `Achievement Unlocked: ${def.title}`,
      message: `${def.icon} ${def.description} (+${def.points} points)`,
      link: `/profile/${userId}`, io
    });
    return achievement;
  } catch (err) { console.error('Achievement error:', err.message); return null; }
};

exports.getUserAchievements = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const achievements = await Achievement.find({ user: userId }).sort({ earnedAt: -1 });
    const user = await User.findById(userId).select('points');
    res.json({ achievements, totalPoints: user?.points || 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ isActive: true, points: { $gt: 0 } })
      .select('name avatar role department points')
      .sort({ points: -1 })
      .limit(20);
    res.json({ leaderboard: users });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
