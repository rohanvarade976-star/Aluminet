const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const { getUserAchievements, getLeaderboard } = require('../controllers/achievements.controller');
router.get('/leaderboard', protect, getLeaderboard);
router.get('/:userId', protect, getUserAchievements);
module.exports = router;
