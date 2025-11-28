const Notification = require('../models/Notification');

/**
 * Send a notification to a user
 */
async function sendNotification(userId, type, title, message, options = {}) {
    try {
        const {
            priority = 'medium',
            channels = ['in-app'],
            metadata = {},
            scheduledFor = null
        } = options;

        const notification = await Notification.create({
            recipient: userId,
            type,
            title,
            message,
            priority,
            channels,
            metadata,
            scheduledFor,
            sentAt: scheduledFor ? null : new Date()
        });

        // Simulate sending via different channels
        if (!scheduledFor) {
            await simulateChannelDelivery(notification);
        }

        return notification;
    } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
}

/**
 * Send bulk notifications to multiple users
 */
async function sendBulkNotifications(userIds, type, title, message, options = {}) {
    try {
        const notifications = [];

        for (const userId of userIds) {
            const notification = await sendNotification(userId, type, title, message, options);
            notifications.push(notification);
        }

        console.log(`📨 Sent ${notifications.length} bulk notifications`);
        return notifications;
    } catch (error) {
        console.error('Error sending bulk notifications:', error);
        throw error;
    }
}

/**
 * Schedule a notification for later delivery
 */
async function scheduleNotification(userId, scheduledFor, type, title, message, options = {}) {
    return sendNotification(userId, type, title, message, {
        ...options,
        scheduledFor
    });
}

/**
 * Get unread count for a user
 */
async function getUnreadCount(userId) {
    return await Notification.countDocuments({
        recipient: userId,
        read: false
    });
}

/**
 * Mark notification as read
 */
async function markAsRead(notificationId) {
    return await Notification.findByIdAndUpdate(
        notificationId,
        { read: true, readAt: new Date() },
        { new: true }
    );
}

/**
 * Mark all notifications as read for a user
 */
async function markAllAsRead(userId) {
    return await Notification.updateMany(
        { recipient: userId, read: false },
        { read: true, readAt: new Date() }
    );
}

/**
 * Process scheduled notifications (called by cron)
 */
async function processScheduledNotifications() {
    try {
        const now = new Date();
        const scheduledNotifications = await Notification.find({
            scheduledFor: { $lte: now },
            sentAt: null
        });

        console.log(`📅 Processing ${scheduledNotifications.length} scheduled notifications`);

        for (const notification of scheduledNotifications) {
            await simulateChannelDelivery(notification);
            notification.sentAt = new Date();
            await notification.save();
        }

        return scheduledNotifications.length;
    } catch (error) {
        console.error('Error processing scheduled notifications:', error);
        throw error;
    }
}

/**
 * Simulate sending notification via different channels
 */
async function simulateChannelDelivery(notification) {
    const notif = await notification.populate('recipient', 'name email phone');

    console.log('\n=== NOTIFICATION DELIVERY SIMULATION ===');
    console.log(`Type: ${notification.type.toUpperCase()}`);
    console.log(`Priority: ${notification.priority}`);
    console.log(`To: ${notif.recipient.name} (${notif.recipient.email})`);
    console.log(`Title: ${notification.title}`);
    console.log(`Message: ${notification.message}`);

    notification.channels.forEach(channel => {
        console.log(`✓ Delivered via: ${channel.toUpperCase()}`);

        if (channel === 'email') {
            console.log(`  📧 Email sent to: ${notif.recipient.email}`);
        } else if (channel === 'sms') {
            console.log(`  📱 SMS sent to: ${notif.recipient.phone || 'N/A'}`);
        } else if (channel === 'push') {
            console.log(`  🔔 Push notification sent`);
        }
    });

    console.log('========================================\n');
}

module.exports = {
    sendNotification,
    sendBulkNotifications,
    scheduleNotification,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    processScheduledNotifications
};
