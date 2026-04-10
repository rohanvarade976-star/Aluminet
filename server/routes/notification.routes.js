const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const { getNotifications, markRead, markOneRead, deleteNotification } = require('../controllers/notification.controller');
router.get('/', protect, getNotifications);
router.put('/read-all', protect, markRead);
router.put('/:id/read', protect, markOneRead);
router.delete('/:id', protect, deleteNotification);
module.exports = router;
