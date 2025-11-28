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
