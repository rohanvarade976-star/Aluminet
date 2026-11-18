const router = require('express').Router();
const { createPost, getPosts, getPost, addReply, upvotePost, deletePost } = require('../controllers/forum.controller');
const { protect } = require('../middleware/auth.middleware');
const { fraudDetect } = require('../middleware/fraud.middleware');

router.get('/', protect, getPosts);
router.post('/', protect, fraudDetect, createPost);
router.get('/:id', protect, getPost);
router.post('/:id/replies', protect, fraudDetect, addReply);
router.post('/:id/upvote', protect, fraudDetect, upvotePost);
router.delete('/:id', protect, fraudDetect, deletePost);

module.exports = router;
