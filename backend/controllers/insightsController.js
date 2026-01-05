const StudentRisk = require('../models/StudentRisk');
const User = require('../models/User');
const { calculateAllStudentRisks, calculateStudentRisk } = require('../utils/riskDetection');

// Get all at-risk students
exports.getAtRiskStudents = async (req, res) => {
    try {
        const { riskLevel, sortBy = 'riskLevel' } = req.query;

        let query = {};
        if (riskLevel && riskLevel !== 'all') {
            query.riskLevel = riskLevel;
        } else {
            // Exclude 'none' by default
            query.riskLevel = { $in: ['at-risk', 'critical'] };
        }

        const students = await StudentRisk.find(query)
            .populate('student', 'name email phone')
            .sort({ riskLevel: -1, attendancePercentage: 1 });

        res.status(200).json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get detailed insights for a specific student
exports.getStudentInsights = async (req, res) => {
    try {
        const studentRisk = await StudentRisk.findOne({ student: req.params.id })
            .populate('student', 'name email phone')
            .populate('notes.addedBy', 'name')
            .populate('incidents.reportedBy', 'name');

        if (!studentRisk) {
            // If no risk record exists, create one
            await calculateStudentRisk(req.params.id);
            const newRisk = await StudentRisk.findOne({ student: req.params.id })
                .populate('student', 'name email phone');
            return res.status(200).json({ success: true, data: newRisk });
        }

        res.status(200).json({ success: true, data: studentRisk });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Manually trigger risk calculation
exports.calculateRisks = async (req, res) => {
    try {
        const result = await calculateAllStudentRisks();
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add a note to a student's risk profile
exports.addNote = async (req, res) => {
    try {
        const { studentId, text } = req.body;

        const studentRisk = await StudentRisk.findOne({ student: studentId });
        if (!studentRisk) {
            return res.status(404).json({ success: false, message: 'Student risk profile not found' });
        }

        studentRisk.notes.push({
            text,
            addedBy: req.user.id
        });

        await studentRisk.save();

        res.status(200).json({ success: true, data: studentRisk });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add an incident to a student's profile
exports.addIncident = async (req, res) => {
    try {
        const { studentId, type, description, severity } = req.body;

        const studentRisk = await StudentRisk.findOne({ student: studentId });
        if (!studentRisk) {
            return res.status(404).json({ success: false, message: 'Student risk profile not found' });
        }

        studentRisk.incidents.push({
            type,
            description,
            severity: severity || 'medium',
            reportedBy: req.user.id
        });

        await studentRisk.save();

        res.status(200).json({ success: true, data: studentRisk });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get dashboard statistics
exports.getInsightsStats = async (req, res) => {
    try {
        const totalAtRisk = await StudentRisk.countDocuments({ riskLevel: 'at-risk' });
        const totalCritical = await StudentRisk.countDocuments({ riskLevel: 'critical' });
        const totalStudents = await User.countDocuments({ role: 'student' });

        const stats = {
            totalStudents,
            atRisk: totalAtRisk,
            critical: totalCritical,
            healthy: totalStudents - totalAtRisk - totalCritical
        };

        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Weak Topics (based on incorrect answers in quiz attempts)
exports.getWeakTopics = async (req, res) => {
    try {
        const userId = req.user.id;
        // Find courses taught by this teacher
        const Course = require('../models/Course');
        const teacherCourses = await Course.find({ instructor: userId }).select('_id');
        const courseIds = teacherCourses.map(c => c._id);

        // Find tests in these courses
        const Test = require('../models/Test');
        const teacherTests = await Test.find({ course: { $in: courseIds } }).select('_id');
        const testIds = teacherTests.map(t => t._id);

        const TestAttempt = require('../models/TestAttempt');

        // Aggregate incorrect answers to find weak tags
        const weakTopics = await TestAttempt.aggregate([
            { $match: { test: { $in: testIds } } },
            { $unwind: '$answers' },
            { $match: { 'answers.isCorrect': false } },
            {
                $lookup: {
                    from: 'questions',
                    localField: 'answers.questionId',
                    foreignField: '_id',
                    as: 'question'
                }
            },
            { $unwind: '$question' },
            { $unwind: '$question.tags' },
            {
                $group: {
                    _id: '$question.tags',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const topics = weakTopics.map(t => t._id);
        res.status(200).json({ success: true, data: topics });
    } catch (error) {
        console.error('Weak Topics Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAtRiskStudents: exports.getAtRiskStudents,
    getStudentInsights: exports.getStudentInsights,
    calculateRisks: exports.calculateRisks,
    addNote: exports.addNote,
    addIncident: exports.addIncident,
    getInsightsStats: exports.getInsightsStats,
    getWeakTopics: exports.getWeakTopics
};
