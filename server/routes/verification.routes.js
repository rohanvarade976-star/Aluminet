const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  submitVerification, getMyVerification,
  getAllVerifications, reviewVerification, uploadMiddleware
} = require('../controllers/verification.controller');

router.get('/me', protect, getMyVerification);
router.post('/submit', protect, uploadMiddleware, submitVerification);
router.get('/all', protect, authorize('admin'), getAllVerifications);
router.put('/:id/review', protect, authorize('admin'), reviewVerification);

module.exports = router;
