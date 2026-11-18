const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { register, login, refreshToken, verifyEmail, logout, getMe, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { loginGuard } = require('../middleware/fraud.middleware');

// Strict in production, relaxed elsewhere; override with AUTH_RATE_LIMIT_MAX
const isProd = process.env.NODE_ENV === 'production';
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || (isProd ? 10 : 1000),
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});

router.post('/register', authLimiter, register);
router.post('/login',    authLimiter, loginGuard, login);
router.post('/refresh',  refreshToken);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
