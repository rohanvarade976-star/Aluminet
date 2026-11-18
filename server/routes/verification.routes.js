const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { fraudDetect } = require('../middleware/fraud.middleware');
const {
  submitVerification, getMyVerification,
  getAllVerifications, reviewVerification, uploadMiddleware, getVerificationFile
} = require('../controllers/verification.controller');

router.get('/me', protect, getMyVerification);
// protect only: access (admin or uploader) is checked in the handler, so an alumnus
// whose verification is still pending can view their own documents
router.get('/:id/file/:field', protect, getVerificationFile);
router.post('/submit', protect, fraudDetect, uploadMiddleware, submitVerification);
router.get('/all', protect, authorize('admin'), getAllVerifications);
router.put('/:id/review', protect, authorize('admin'), reviewVerification);

module.exports = router;
