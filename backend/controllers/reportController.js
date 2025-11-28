const ParentReport = require('../models/ParentReport');
const StudentRisk = require('../models/StudentRisk');
const User = require('../models/User');

// Report templates
const templates = {
    'at-risk': {
        subject: 'Academic Support Needed for {studentName}',
        body: `Dear Parent,

We would like to bring to your attention that {studentName} requires additional support in their studies.

Current Status:
- Attendance: {attendance}%
- Test Average: {testAverage}%

{factors}

We recommend scheduling a meeting to discuss how we can help {studentName} improve their performance.

Best regards,
{teacherName}
{schoolName}`
    },
    'critical': {
        subject: 'URGENT: Immediate Attention Required for {studentName}',
        body: `URGENT: Dear Parent,

{studentName}'s academic performance requires immediate attention.

Critical Concerns:
- Attendance: {attendance}%
- Test Average: {testAverage}%

{factors}

Please contact us immediately to arrange a meeting.

Best regards,
{teacherName}
{schoolName}`
    }
};

// Generate report preview
exports.previewReport = async (req, res) => {
    try {
        const { studentId, template = 'at-risk', customMessage } = req.body;

        const studentRisk = await StudentRisk.findOne({ student: studentId })
            .populate('student', 'name email phone');

        if (!studentRisk) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const teacher = await User.findById(req.user.id);

        // Build factors list
        const factorsList = studentRisk.factors.map(f => `- ${f.description}`).join('\n');

        // Generate message from template
        let message = templates[template]?.body || customMessage;
        let subject = templates[template]?.subject || 'Student Report';

        // Replace placeholders
        message = message
            .replace(/{studentName}/g, studentRisk.student.name)
            .replace(/{attendance}/g, studentRisk.attendancePercentage)
            .replace(/{testAverage}/g, studentRisk.testAverage)
            .replace(/{factors}/g, factorsList || 'No specific factors identified.')
            .replace(/{teacherName}/g, teacher.name)
            .replace(/{schoolName}/g, 'Learning Management System');

        subject = subject.replace(/{studentName}/g, studentRisk.student.name);

        res.status(200).json({
            success: true,
            data: {
                subject,
                message,
                studentName: studentRisk.student.name,
                studentEmail: studentRisk.student.email,
                studentPhone: studentRisk.student.phone
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Send parent report
exports.sendReport = async (req, res) => {
    try {
        const { studentId, channel, template, customMessage, recipientEmail, recipientPhone } = req.body;

        const studentRisk = await StudentRisk.findOne({ student: studentId })
            .populate('student', 'name email phone');

        if (!studentRisk) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const teacher = await User.findById(req.user.id);

        // Build factors list
        const factorsList = studentRisk.factors.map(f => `- ${f.description}`).join('\n');

        // Generate message
        let message = customMessage || templates[template]?.body || '';
        let subject = templates[template]?.subject || 'Student Report';

        message = message
            .replace(/{studentName}/g, studentRisk.student.name)
            .replace(/{attendance}/g, studentRisk.attendancePercentage)
            .replace(/{testAverage}/g, studentRisk.testAverage)
            .replace(/{factors}/g, factorsList || 'No specific factors identified.')
            .replace(/{teacherName}/g, teacher.name)
            .replace(/{schoolName}/g, 'Learning Management System');

        subject = subject.replace(/{studentName}/g, studentRisk.student.name);

        // Simulate sending based on channel
        let status = 'sent';
        let errorMessage = null;

        console.log('\n=== PARENT REPORT SIMULATION ===');
        console.log(`Channel: ${channel.toUpperCase()}`);
        console.log(`To: ${recipientEmail || recipientPhone || studentRisk.student.email}`);
        console.log(`Subject: ${subject}`);
        console.log(`Message:\n${message}`);
        console.log('================================\n');

        // In production, integrate with actual services:
        // if (channel === 'email') {
        //     await sendEmailViaSendGrid(recipientEmail, subject, message);
        // } else if (channel === 'sms') {
        //     await sendSMSViaTwilio(recipientPhone, message);
        // } else if (channel === 'whatsapp') {
        //     await sendWhatsAppMessage(recipientPhone, message);
        // }

        // Create report record
        const report = await ParentReport.create({
            student: studentId,
            sentBy: req.user.id,
            channel,
            template: template || 'custom',
            subject,
            message,
            recipientEmail: recipientEmail || studentRisk.student.email,
            recipientPhone: recipientPhone || studentRisk.student.phone,
            status,
            sentAt: new Date(),
            errorMessage
        });

        res.status(200).json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get report history for a student
exports.getReportHistory = async (req, res) => {
    try {
        const reports = await ParentReport.find({ student: req.params.studentId })
            .populate('sentBy', 'name')
            .sort({ sentAt: -1 });

        res.status(200).json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
