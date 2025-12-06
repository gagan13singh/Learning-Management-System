const Attendance = require('../models/Attendance');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @desc    Mark Attendance
// @route   POST /api/attendance/mark
// @access  Private (Teacher)
exports.markAttendance = async (req, res) => {
    try {
        const { courseId, subject, date, records } = req.body; // records: [{ studentId, status }]

        // Validate course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const attendanceDate = new Date(date);

        // Process records
        const operations = records.map(record => ({
            updateOne: {
                filter: {
                    student: record.studentId,
                    course: courseId,
                    subject: subject,
                    date: attendanceDate
                },
                update: {
                    $set: {
                        status: record.status,
                        markedBy: req.user.id
                    }
                },
                upsert: true
            }
        }));

        if (operations.length > 0) {
            await Attendance.bulkWrite(operations);
        }

        res.status(200).json({ success: true, message: 'Attendance marked successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Student Attendance Summary
// @route   GET /api/attendance/summary
// @access  Private (Student)
exports.getAttendanceSummary = async (req, res) => {
    try {
        // Aggregate attendance by subject
        const attendance = await Attendance.aggregate([
            { $match: { student: new mongoose.Types.ObjectId(req.user.id) } },
            {
                $group: {
                    _id: '$subject',
                    totalClasses: { $sum: 1 },
                    presentClasses: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'present'] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        const summary = attendance.map(a => ({
            subject: a._id,
            percentage: Math.round((a.presentClasses / a.totalClasses) * 100),
            total: a.totalClasses,
            present: a.presentClasses
        }));

        res.status(200).json({ success: true, data: summary });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Attendance for Course (Teacher)
// @route   GET /api/attendance/course/:courseId
// @access  Private (Teacher)
exports.getCourseAttendance = async (req, res) => {
    try {
        const { date, subject } = req.query;
        let query = { course: req.params.courseId };

        if (date) query.date = new Date(date);
        if (subject) query.subject = subject;

        const records = await Attendance.find(query)
            .populate('student', 'name email')
            .sort({ date: -1 });

        res.status(200).json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
