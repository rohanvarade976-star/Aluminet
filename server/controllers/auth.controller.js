const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'fallback_refresh',
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
  return { accessToken, refreshToken };
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department, graduationYear } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    const user = await User.create({
      name, email, password,
      role: role === 'admin' ? 'student' : (role || 'student'),
      department: department || '',
      graduationYear: graduationYear || null,
      isVerified: true, // Auto-verify for now (no email service required)
    });

    const { accessToken, refreshToken } = generateTokens(user._id);
    await User.findByIdAndUpdate(user._id, { refreshToken });

    res.status(201).json({
      message: 'Registration successful!',
      accessToken,
      refreshToken,
      user: user.toSafeObject()
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.isActive) return res.status(401).json({ error: 'Account deactivated' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user._id);
    await User.findByIdAndUpdate(user._id, {
      refreshToken,
      lastLogin: new Date(),
      $inc: { loginCount: 1 }
    });

    res.json({ accessToken, refreshToken, user: user.toSafeObject() });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback_refresh');
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const tokens = generateTokens(user._id);
    await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });
    res.json(tokens);
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      emailVerifyToken: hashed,
      emailVerifyExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ error: 'Invalid or expired verification link' });

    user.isVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpires = undefined;
    await user.save();
    res.json({ message: 'Email verified successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: '' });
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};
