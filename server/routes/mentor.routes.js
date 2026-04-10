const router = require('express').Router();
const { getMatches, getAllMentors, bookSession, getMySessions, updateSession } = require('../controllers/mentor.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', protect, getAllMentors);
router.get('/matches', protect, authorize('student'), getMatches);
router.get('/sessions', protect, getMySessions);
router.post('/sessions', protect, authorize('student'), bookSession);
router.put('/sessions/:id', protect, updateSession);

module.exports = router;
