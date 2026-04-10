const router = require('express').Router();
const { register, login, refreshToken, verifyEmail, logout, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.get('/verify-email/:token', verifyEmail);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
