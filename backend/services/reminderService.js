const User = require('../models/User');
const StudentRisk = require('../models/StudentRisk');
const Test = require('../models/Test');
const Attendance = require('../models/Attendance');
const { sendNotification, sendBulkNotifications } = require('./notificationService');

/**
 * Check for students with low attendance and send reminders
 */
async function checkLowAttendance() {
    try {
        console.log('🔍 Checking for low attendance...');

        // Get all students with attendance < 75%
        const lowAttendanceStudents = await StudentRisk.find({
            attendancePercentage: { $lt: 75 }
        }).populate('student', 'name email');

        console.log(`Found ${lowAttendanceStudents.length} students with low attendance`);

        for (const studentRisk of lowAttendanceStudents) {
            const student = studentRisk.student;

            // Send notification to student
            await sendNotification(
                student._id,
                'attendance',
                '⚠️ Low Attendance Alert',
                `Your attendance is currently ${studentRisk.attendancePercentage}%. Please improve your attendance to stay on track.`,
                {
                    priority: 'high',
                    channels: ['in-app', 'email'],
                    metadata: { attendancePercentage: studentRisk.attendancePercentage }
                }
            );

            // Note: In production, also send to parents
            // await sendNotification(parentId, 'attendance', ...)
        }

        return lowAttendanceStudents.length;
    } catch (error) {
        console.error('Error checking low attendance:', error);
        throw error;
    }
}

/**
 * Check for upcoming tests and send reminders
 */
async function checkUpcomingTests() {
    try {
        console.log('🔍 Checking for upcoming tests...');

        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Find tests in next 3 days
        const upcomingTests = await Test.find({
            date: {
                $gte: tomorrow,
                $lte: threeDaysFromNow
            }
        }).populate('course', 'title');

        console.log(`Found ${upcomingTests.length} upcoming tests`);

        for (const test of upcomingTests) {
            const daysUntil = Math.ceil((test.date - new Date()) / (1000 * 60 * 60 * 24));

            // Get enrolled students
            const Enrollment = require('../models/Enrollment');
            const enrollments = await Enrollment.find({ course: test.course._id }).populate('student');

            const studentIds = enrollments.map(e => e.student._id);

            if (studentIds.length > 0) {
                await sendBulkNotifications(
                    studentIds,
                    'test',
                    `📝 Upcoming Test: ${test.title}`,
                    `Test on ${test.course.title} is scheduled in ${daysUntil} day(s) on ${test.date.toDateString()}. Total Marks: ${test.totalMarks}`,
                    {
                        priority: 'high',
                        channels: ['in-app', 'email'],
                        metadata: { testId: test._id, courseId: test.course._id, daysUntil }
                    }
                );
            }
        }

        return upcomingTests.length;
    } catch (error) {
        console.error('Error checking upcoming tests:', error);
        throw error;
    }
}

/**
 * Send monthly fee reminders
 */
async function sendFeeReminders() {
    try {
        console.log('💰 Sending monthly fee reminders...');

        // Get all active students
        const students = await User.find({ role: 'student' });

        console.log(`Sending fee reminders to ${students.length} students`);

        const studentIds = students.map(s => s._id);

        if (studentIds.length > 0) {
            await sendBulkNotifications(
                studentIds,
                'fee',
                '💰 Monthly Fee Payment Reminder',
                'This is a reminder that your monthly fee payment is due. Please make the payment at your earliest convenience to avoid any interruption in services.',
                {
                    priority: 'medium',
                    channels: ['in-app', 'email', 'sms'],
                    metadata: { month: new Date().toLocaleString('default', { month: 'long' }) }
                }
            );
        }

        return students.length;
    } catch (error) {
        console.error('Error sending fee reminders:', error);
        throw error;
    }
}

/**
 * Send teacher alerts for new registrations and edge cases
 */
async function sendTeacherAlerts() {
    try {
        console.log('👨‍🏫 Checking for teacher alerts...');

        // Get all teachers
        const teachers = await User.find({ role: 'teacher' });

        // Check for critical risk students
        const criticalStudents = await StudentRisk.find({
            riskLevel: 'critical'
        }).populate('student', 'name');

        if (criticalStudents.length > 0) {
            const teacherIds = teachers.map(t => t._id);

            await sendBulkNotifications(
                teacherIds,
                'alert',
                `🚨 ${criticalStudents.length} Students at Critical Risk`,
                `There are ${criticalStudents.length} students who require immediate attention. Please review the Insights dashboard.`,
                {
                    priority: 'high',
                    channels: ['in-app'],
                    metadata: { criticalCount: criticalStudents.length }
                }
            );
        }

        return criticalStudents.length;
    } catch (error) {
        console.error('Error sending teacher alerts:', error);
        throw error;
    }
}

module.exports = {
    checkLowAttendance,
    checkUpcomingTests,
    sendFeeReminders,
    sendTeacherAlerts
};
