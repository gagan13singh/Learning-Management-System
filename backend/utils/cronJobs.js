const cron = require('node-cron');
const { calculateAllStudentRisks } = require('./riskDetection');
const { processScheduledNotifications } = require('../services/notificationService');
const {
    checkLowAttendance,
    checkUpcomingTests,
    sendFeeReminders,
    sendTeacherAlerts
} = require('../services/reminderService');

/**
 * Initialize all cron jobs
 */
function initializeCronJobs() {
    console.log('📅 Initializing cron jobs...');

    // Daily risk detection at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('🌙 Running daily risk detection at midnight...');
        try {
            await calculateAllStudentRisks();
        } catch (error) {
            console.error('Error in daily risk detection:', error);
        }
    });

    // Process scheduled notifications every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        try {
            await processScheduledNotifications();
        } catch (error) {
            console.error('Error processing scheduled notifications:', error);
        }
    });

    // Daily attendance reminders at 9 PM
    cron.schedule('0 21 * * *', async () => {
        console.log('📊 Running daily attendance check at 9 PM...');
        try {
            await checkLowAttendance();
        } catch (error) {
            console.error('Error checking low attendance:', error);
        }
    });

    // Daily test reminders at 8 AM
    cron.schedule('0 8 * * *', async () => {
        console.log('📝 Checking for upcoming tests at 8 AM...');
        try {
            await checkUpcomingTests();
        } catch (error) {
            console.error('Error checking upcoming tests:', error);
        }
    });

    // Monthly fee reminders on 1st at 9 AM
    cron.schedule('0 9 1 * *', async () => {
        console.log('💰 Sending monthly fee reminders...');
        try {
            await sendFeeReminders();
        } catch (error) {
            console.error('Error sending fee reminders:', error);
        }
    });

    // Teacher alerts every 6 hours
    cron.schedule('0 */6 * * *', async () => {
        console.log('👨‍🏫 Checking for teacher alerts...');
        try {
            await sendTeacherAlerts();
        } catch (error) {
            console.error('Error sending teacher alerts:', error);
        }
    });

    console.log('✅ Cron jobs initialized');
    console.log('  - Risk detection: Daily at midnight');
    console.log('  - Scheduled notifications: Every 5 minutes');
    console.log('  - Attendance reminders: Daily at 9 PM');
    console.log('  - Test reminders: Daily at 8 AM');
    console.log('  - Fee reminders: Monthly on 1st at 9 AM');
    console.log('  - Teacher alerts: Every 6 hours');
}

module.exports = { initializeCronJobs };

