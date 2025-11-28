const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Course = require('../models/Course');
const Batch = require('../models/Batch');

// Calculate Student Behaviour Score & Risk Status
exports.getStudentBehaviour = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const student = await User.findById(studentId);

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Mock Logic for Behaviour Score (0-100)
        // In real app, calculate based on attendance %, test scores, homework completion
        let score = 85;
        let risk = 'Consistent';

        // Example logic:
        // const attendance = await Attendance.find({ 'records.student': studentId });
        // ... calculate percentage ...

        if (score < 50) risk = 'Critical';
        else if (score < 75) risk = 'Risk';

        // Update user
        student.behaviourScore = score;
        student.riskStatus = risk;
        await student.save();

        res.status(200).json({ success: true, score, risk, student });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Generate Parent Update Report
exports.getParentUpdateReport = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const student = await User.findById(studentId);

        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        // Mock Report Data
        const report = {
            studentName: student.name,
            date: new Date().toLocaleDateString(),
            attendance: '85%',
            recentTestScore: '78/100',
            behaviour: student.riskStatus,
            message: `Dear Parent, ${student.name} is currently ${student.riskStatus}. Please ensure they attend regular classes.`
        };

        // In real app, trigger email/SMS here using student.parentEmail / student.parentPhone

        res.status(200).json({ success: true, report, message: 'Report generated and sent to parent.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Dashboard Stats for Teacher
exports.getTeacherStats = async (req, res) => {
    try {
        const teacherId = req.user.id;

        // 1. Get Teacher's Courses
        const courses = await Course.find({ instructor: teacherId });
        const courseIds = courses.map(c => c._id);

        // 2. Get Batches for these courses
        const batches = await Batch.find({ courses: { $in: courseIds } });
        const batchIds = batches.map(b => b._id);

        // 3. Calculate Total Students (Unique)
        const totalStudents = courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0);

        // 4. Calculate Avg Attendance
        const attendanceRecords = await Attendance.find({ batch: { $in: batchIds } });
        let totalRecords = 0;
        let presentRecords = 0;

        attendanceRecords.forEach(record => {
            record.records.forEach(studentRec => {
                totalRecords++;
                if (studentRec.status === 'PRESENT') {
                    presentRecords++;
                }
            });
        });

        const avgAttendance = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

        // 5. Calculate At Risk Students
        const atRiskCount = await User.countDocuments({
            batches: { $in: batchIds },
            riskStatus: { $in: ['Risk', 'Critical'] }
        });

        res.status(200).json({
            success: true,
            stats: {
                totalStudents,
                avgAttendance,
                atRisk: atRiskCount,
                totalCourses: courses.length
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
