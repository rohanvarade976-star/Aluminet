const FraudLog = require('../models/FraudLog');
const User = require('../models/User');

const fraudDetect = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const userId = req.user?._id;
    let score = 0;
    const reasons = [];

    // Check rapid requests (basic heuristic)
    const recentLogs = await FraudLog.countDocuments({
      ip,
      createdAt: { $gte: new Date(Date.now() - 60 * 1000) }
    });
    if (recentLogs > 20) { score += 30; reasons.push('High request rate'); }

    // Check if user is already flagged
    if (userId) {
      const user = await User.findById(userId).select('fraudScore isFlagged');
      if (user?.isFlagged) { score += 50; reasons.push('Previously flagged account'); }
      if (user?.fraudScore > 80) { score += 20; reasons.push('High cumulative fraud score'); }
    }

    if (score > 70) {
      await FraudLog.create({ user: userId, ip, action: req.method + ' ' + req.path, reason: reasons.join(', '), score });
      if (userId) await User.findByIdAndUpdate(userId, { $inc: { fraudScore: score }, isFlagged: score > 80 });
      return res.status(429).json({ error: 'Suspicious activity detected. Contact admin.' });
    }

    next();
  } catch (err) {
    next();
  }
};

module.exports = { fraudDetect };
