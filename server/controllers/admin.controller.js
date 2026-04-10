const User = require('../models/User');
const Event = require('../models/Event');
const MentorSession = require('../models/MentorSession');
const ForumPost = require('../models/ForumPost');
const FraudLog = require('../models/FraudLog');

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, students, alumni, events, sessions, fraudLogs, recentUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'alumni' }),
      Event.countDocuments(),
      MentorSession.countDocuments(),
      FraudLog.countDocuments({ resolved: false }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role avatar createdAt isVerified')
    ]);

    // Monthly signups for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlySignups = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      stats: { totalUsers, students, alumni, events, sessions, pendingFraud: fraudLogs },
      recentUsers,
      monthlySignups
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20, flagged } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (flagged === 'true') filter.isFlagged = true;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];

    const users = await User.find(filter)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit));
    const total = await User.countDocuments(filter);

    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { isActive, isFlagged, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...(isActive !== undefined && { isActive }), ...(isFlagged !== undefined && { isFlagged }), ...(role && { role }) },
      { new: true }
    ).select('-password -refreshToken');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFraudLogs = async (req, res) => {
  try {
    const logs = await FraudLog.find({ resolved: false })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 }).limit(50);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resolveFraudLog = async (req, res) => {
  try {
    const log = await FraudLog.findByIdAndUpdate(req.params.id, { resolved: true, resolvedBy: req.user._id }, { new: true });
    if (!log) return res.status(404).json({ error: 'Log not found' });
    res.json({ log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
