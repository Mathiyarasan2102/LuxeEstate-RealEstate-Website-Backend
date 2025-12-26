const express = require('express');
const router = express.Router();
const { getUserNotifications, markNotificationRead, markAllRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getUserNotifications);
router.put('/:id/read', protect, markNotificationRead);
router.put('/read/all', protect, markAllRead);

module.exports = router;
