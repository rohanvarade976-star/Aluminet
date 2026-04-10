const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -refreshToken');
    if (!user || !user.isActive) return res.status(401).json({ error: 'Unauthorized' });
    req.user = user;
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Access denied' });
  next();
};

module.exports = { protect, authorize };
