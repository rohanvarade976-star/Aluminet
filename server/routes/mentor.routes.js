const router = require('express').Router();
const { getMatches, getAllMentors, bookSession, getMySessions, updateSession } = require('../controllers/mentor.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { fraudDetect } = require('../middleware/fraud.middleware');

router.get('/', protect, getAllMentors);
router.get('/matches', protect, authorize('student'), getMatches);
router.get('/sessions', protect, getMySessions);
router.post('/sessions', protect, fraudDetect, authorize('student'), bookSession);
router.put('/sessions/:id', protect, fraudDetect, updateSession);

module.exports = router;
