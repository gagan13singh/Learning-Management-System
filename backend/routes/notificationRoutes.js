const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getNotifications,
    getUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    sendNewNotification,
    sendBulkNotification,
    scheduleNewNotification,
    deleteNotification
} = require('../controllers/notificationController');

// User notification routes
router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/:id/read', protect, markNotificationAsRead);
router.put('/mark-all-read', protect, markAllNotificationsAsRead);
router.delete('/:id', protect, deleteNotification);

// Admin/Teacher notification routes
router.post('/send', protect, authorize('admin', 'teacher'), sendNewNotification);
router.post('/send-bulk', protect, authorize('admin', 'teacher'), sendBulkNotification);
router.post('/schedule', protect, authorize('admin', 'teacher'), scheduleNewNotification);

module.exports = router;
