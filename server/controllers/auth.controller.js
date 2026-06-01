const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail, isEmailConfigured } = require('../services/emailService');
const { awardAchievement } = require('./achievements.controller');

// Guard: crash on startup if JWT secrets are not set
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error('❌ FATAL: JWT_SECRET and JWT_REFRESH_SECRET must be set in .env');
  process.exit(1);
}

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
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
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    // Generate email verification token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role === 'admin' ? 'student' : (role || 'student'),
      department: department || '',
      graduationYear: graduationYear || null,
      isVerified: false,
      emailVerifyToken: hashedToken,
      emailVerifyExpires: tokenExpiry,
    });

    // Send verification email (non-blocking — don't fail registration if email fails)
    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${rawToken}`;
    sendEmail({
      to: user.email,
      subject: '✉️ Verify your AlumiNet account',
      html: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px">
        <h2 style="color:#4f46e5">Welcome to AlumiNet, ${user.name}! 🎓</h2>
        <p>Please verify your email to activate your account.</p>
        <a href="${verifyUrl}" style="display:inline-block;background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">
          Verify Email
        </a>
        <p style="color:#64748b;font-size:13px;margin-top:16px">This link expires in 24 hours.</p>
      </div>`
    }).catch(err => console.warn('Email send failed (non-critical):', err.message));

    const { accessToken, refreshToken } = generateTokens(user._id);
    await User.findByIdAndUpdate(user._id, { refreshToken });

    res.status(201).json({
      message: 'Registration successful! Please verify your email.',
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

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.isActive) return res.status(401).json({ error: 'Account deactivated. Contact admin.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user._id);
    await User.findByIdAndUpdate(user._id, {
      refreshToken,
      lastLogin: new Date(),
      $inc: { loginCount: 1 }
    });

    // Award first_login achievement (idempotent — only fires once)
    awardAchievement(user._id, 'first_login', null).catch(() => {});

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

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
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
    res.json({ message: 'Email verified successfully! You can now log in.' });
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

// Forgot password — send reset link
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always return success to prevent email enumeration
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.', emailSent: true });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.emailVerifyToken = hashedToken;
    user.emailVerifyExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${rawToken}`;
    const emailResult = await sendEmail({
      to: user.email,
      subject: '🔑 Reset your AlumiNet password',
      html: `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px">
        <h2 style="color:#4f46e5">Password Reset</h2>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">
          Reset Password
        </a>
        <p style="color:#64748b;font-size:13px;margin-top:16px">If you did not request this, ignore this email.</p>
      </div>`
    });

    const isDev = process.env.NODE_ENV !== 'production';

    if (!emailResult.ok) {
      console.warn('⚠️ Password reset email not sent:', emailResult.error || 'SMTP not configured');
      if (isDev) {
        console.log('🔗 Dev reset link (copy to browser):', resetUrl);
      }
    }

    res.json({
      message: emailResult.ok
        ? 'If that email exists, a reset link has been sent.'
        : 'Reset link created. Email could not be sent — check server email settings or use the dev link below.',
      emailSent: emailResult.ok,
      emailConfigured: isEmailConfigured(),
      ...(isDev && !emailResult.ok ? { devResetUrl: resetUrl } : {}),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      emailVerifyToken: hashed,
      emailVerifyExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ error: 'Invalid or expired reset link' });

    user.password = password;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpires = undefined;
    user.refreshToken = '';
    await user.save();

    res.json({ message: 'Password reset successful! Please log in.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
