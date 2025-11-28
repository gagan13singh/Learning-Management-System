const StudentRisk = require('../models/StudentRisk');
const Attendance = require('../models/Attendance');
const Test = require('../models/Test');
const TestAttempt = require('../models/TestAttempt');
const User = require('../models/User');

/**
 * Calculate risk level for all students
 */
async function calculateAllStudentRisks() {
    try {
        console.log('🔍 Starting risk detection...');

        // Get all students
        const students = await User.find({ role: 'student' });
        console.log(`Found ${students.length} students to analyze`);

        let atRiskCount = 0;
        let criticalCount = 0;

        for (const student of students) {
            await calculateStudentRisk(student._id);

            // Get updated risk
            const risk = await StudentRisk.findOne({ student: student._id });
            if (risk) {
                if (risk.riskLevel === 'at-risk') atRiskCount++;
                if (risk.riskLevel === 'critical') criticalCount++;
            }
        }

        console.log(`✅ Risk detection complete: ${atRiskCount} at-risk, ${criticalCount} critical`);
        return { atRiskCount, criticalCount, total: students.length };
    } catch (error) {
        console.error('❌ Risk detection error:', error);
        throw error;
    }
}

/**
 * Calculate risk for a single student
 */
async function calculateStudentRisk(studentId) {
    try {
        // Calculate attendance percentage (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const attendanceRecords = await Attendance.find({
            date: { $gte: thirtyDaysAgo },
            'students.student': studentId
        });

        let totalDays = 0;
        let presentDays = 0;

        attendanceRecords.forEach(record => {
            const studentRecord = record.students.find(s => s.student.toString() === studentId.toString());
            if (studentRecord) {
                totalDays++;
                if (studentRecord.status === 'present') presentDays++;
            }
        });

        const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

        // Calculate test average
        const testAttempts = await TestAttempt.find({
            student: studentId,
            status: 'completed'
        });

        let testAverage = 0;
        if (testAttempts.length > 0) {
            const totalPercentage = testAttempts.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0);
            testAverage = Math.round(totalPercentage / testAttempts.length);
        }

        // Determine risk level and factors
        let riskLevel = 'none';
        const factors = [];

        // Critical: Attendance < 40% OR Test avg < 30%
        if (attendancePercentage < 40) {
            riskLevel = 'critical';
            factors.push({ type: 'attendance', description: `Very low attendance: ${attendancePercentage}%` });
        }
        if (testAverage < 30 && testAttempts.length > 0) {
            riskLevel = 'critical';
            factors.push({ type: 'academic', description: `Very low test average: ${testAverage}%` });
        }

        // At-Risk: Attendance < 60% OR Test avg < 50%
        if (riskLevel === 'none') {
            if (attendancePercentage < 60) {
                riskLevel = 'at-risk';
                factors.push({ type: 'attendance', description: `Low attendance: ${attendancePercentage}%` });
            }
            if (testAverage < 50 && testAttempts.length > 0) {
                riskLevel = 'at-risk';
                factors.push({ type: 'academic', description: `Low test average: ${testAverage}%` });
            }
        }

        // Update or create StudentRisk record
        const riskData = {
            student: studentId,
            riskLevel,
            attendancePercentage,
            testAverage,
            factors,
            lastCalculated: new Date()
        };

        await StudentRisk.findOneAndUpdate(
            { student: studentId },
            riskData,
            { upsert: true, new: true }
        );

        return riskData;
    } catch (error) {
        console.error(`Error calculating risk for student ${studentId}:`, error);
        throw error;
    }
}

module.exports = {
    calculateAllStudentRisks,
    calculateStudentRisk
};
