const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -refreshToken -emailVerifyToken');
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
      .select('-password -refreshToken');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    // Without Cloudinary, just return success
    res.json({ message: 'Avatar upload requires Cloudinary setup', user: req.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { q, role } = req.query;
    if (!q) return res.json({ users: [] });
    const filter = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { skills: { $in: [new RegExp(q, 'i')] } },
        { currentRole: { $regex: q, $options: 'i' } }
      ],
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
