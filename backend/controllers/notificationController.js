const Notification = require('../models/Notification');
const {
    sendNotification,
    sendBulkNotifications,
    scheduleNotification,
    getUnreadCount,
    markAsRead,
    markAllAsRead
} = require('../services/notificationService');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// Get user notifications
exports.getNotifications = async (req, res) => {
    try {
        const { type, read, limit = 50 } = req.query;

        let query = { recipient: req.user.id };

        if (type) query.type = type;
        if (read !== undefined) query.read = read === 'true';

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await getUnreadCount(req.user.id);
        res.status(200).json({ success: true, data: { count } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
    try {
        const notification = await markAsRead(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark all as read
exports.markAllNotificationsAsRead = async (req, res) => {
    try {
        await markAllAsRead(req.user.id);
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Send notification (admin/teacher only)
exports.sendNewNotification = async (req, res) => {
    try {
        const { recipientId, type, title, message, priority, channels } = req.body;

        const notification = await sendNotification(
            recipientId,
            type,
            title,
            message,
            { priority, channels }
        );

        res.status(201).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Send bulk notifications (admin/teacher only)
exports.sendBulkNotification = async (req, res) => {
    try {
        const { recipientIds, type, title, message, priority, channels } = req.body;

        const notifications = await sendBulkNotifications(
            recipientIds,
            type,
            title,
            message,
            { priority, channels }
        );

        res.status(201).json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Schedule notification (admin/teacher only)
exports.scheduleNewNotification = async (req, res) => {
    try {
        const { recipientId, scheduledFor, type, title, message, priority, channels } = req.body;

        const notification = await scheduleNotification(
            recipientId,
            new Date(scheduledFor),
            type,
            title,
            message,
            { priority, channels }
        );

        res.status(201).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            recipient: req.user.id
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Legacy: Send Test Notification (kept for backward compatibility)
exports.sendTestNotification = async (test) => {
    try {
        const course = await Course.findById(test.course);

        if (!course) {
            console.log('Notification Error: Course not found');
            return;
        }

        // Get all students enrolled in this course
        const enrollments = await Enrollment.find({ course: test.course }).populate('student');
        const studentCount = enrollments.length;

        const message = `Dear Parents, a ${test.type} test on "${test.title}" for ${course.title} (Syllabus: ${test.syllabus}) is scheduled for ${new Date(test.date).toDateString()}. Total Marks: ${test.totalMarks}. Please ensure your ward prepares well.`;

        console.log('--- NOTIFICATION SIMULATION ---');
        console.log(`To: Parents of ${studentCount} students in ${course.title}`);
        console.log(`Message: ${message}`);
        console.log('-------------------------------');

        return { success: true, message };
    } catch (error) {
        console.error('Notification Error:', error);
        return { success: false, error: error.message };
    }
};
