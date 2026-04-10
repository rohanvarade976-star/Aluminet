const router = require('express').Router();
const { getDashboardStats, getAllUsers, updateUser, getFraudLogs, resolveFraudLog } = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.get('/fraud', getFraudLogs);
router.put('/fraud/:id/resolve', resolveFraudLog);

module.exports = router;
