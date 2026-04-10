const router = require('express').Router();
const { getProfile, updateProfile, uploadAvatar, searchUsers } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/search', protect, searchUsers);
router.get('/:id', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;
