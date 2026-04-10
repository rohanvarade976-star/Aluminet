const router = require('express').Router();
const { createPost, getPosts, getPost, addReply, upvotePost, deletePost } = require('../controllers/forum.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getPosts);
router.post('/', protect, createPost);
router.get('/:id', protect, getPost);
router.post('/:id/replies', protect, addReply);
router.post('/:id/upvote', protect, upvotePost);
router.delete('/:id', protect, deletePost);

module.exports = router;
