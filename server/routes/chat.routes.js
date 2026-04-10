const router = require('express').Router();
const { getRoomMessages, getMyRooms, deleteMessage } = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/rooms', protect, getMyRooms);
router.get('/rooms/:room', protect, getRoomMessages);
router.delete('/messages/:id', protect, deleteMessage);

module.exports = router;
