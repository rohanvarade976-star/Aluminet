const User = require('../models/User');
const { awardAchievement } = require('./achievements.controller');
const { PUBLIC_USER_SELECT, FULL_USER_SELECT } = require('../utils/userFields');

exports.getProfile = async (req, res) => {
  try {
    // Owner and admins get the full profile (minus secrets); everyone else only public fields
    const canSeeFull = req.user._id.toString() === req.params.id || req.user.role === 'admin';
    const user = await User.findById(req.params.id)
      .select(canSeeFull ? FULL_USER_SELECT : PUBLIC_USER_SELECT);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'bio', 'skills', 'interests', 'department',
      'graduationYear', 'currentCompany', 'currentRole', 'location', 'linkedIn', 'github'];
    const updates = {};
    allowed.forEach(key => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
      .select(FULL_USER_SELECT);

    // Award profile_complete if all key fields are filled
    const updated = await User.findById(req.user._id);
    const isComplete = updated.bio && updated.skills?.length > 0
      && updated.department && updated.currentRole;
    if (isComplete) {
      awardAchievement(req.user._id, 'profile_complete', req.io).catch(() => {});
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    
    // Construct local public URL
    const avatarUrl = `${process.env.SERVER_URL || 'http://localhost:5000'}/uploads/avatars/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select(FULL_USER_SELECT);

    res.json({ message: 'Avatar updated successfully', user, avatarUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { q, role } = req.query;
    if (!q) return res.json({ users: [] });
    const filter = {
      $text: { $search: q },
      isActive: true
    };
    if (role) filter.role = role;
    const users = await User.find(filter)
      .select('name avatar role department currentRole currentCompany')
      .limit(20);
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
