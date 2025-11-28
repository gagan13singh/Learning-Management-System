const Attendance = require('../models/Attendance');
const Batch = require('../models/Batch');
const User = require('../models/User');

// Mark Attendance
exports.markAttendance = async (req, res) => {
    try {
        const { batchId, date, records } = req.body; // records: [{ studentId, status, remarks }]

        // Check if attendance already exists for this date
        let attendance = await Attendance.findOne({ batch: batchId, date: new Date(date) });

        if (attendance) {
            // Update existing
            attendance.records = records.map(r => ({
                student: r.studentId,
                status: r.status,
                remarks: r.remarks
            }));
            attendance.markedBy = req.user.id;
        } else {
            // Create new
            attendance = new Attendance({
                batch: batchId,
                date: new Date(date),
                records: records.map(r => ({
                    student: r.studentId,
                    status: r.status,
                    remarks: r.remarks
                })),
                markedBy: req.user.id
            });
        }

        await attendance.save();

        // Trigger Parent Updates for Absentees (Mock)
        const absentees = records.filter(r => r.status === 'ABSENT');
        absentees.forEach(async (record) => {
            const student = await User.findById(record.studentId);
            if (student && student.parentEmail) {
                console.log(`Sending Parent Update to ${student.parentEmail}: Your child ${student.name} is absent today.`);
                // In real app: sendEmail(student.parentEmail, ...)
            }
        });

        res.status(200).json({ success: true, message: 'Attendance marked successfully', attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Attendance Report for a Batch
exports.getBatchAttendance = async (req, res) => {
    try {
        const { batchId } = req.params;
        const attendanceRecords = await Attendance.find({ batch: batchId }).sort({ date: -1 });
        res.status(200).json({ success: true, attendanceRecords });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Student Attendance History
exports.getStudentAttendance = async (req, res) => {
    try {
        const { studentId } = req.params;
        // Find all attendance records where this student exists
        const records = await Attendance.find({ 'records.student': studentId });

        const history = records.map(record => {
            const studentRecord = record.records.find(r => r.student.toString() === studentId);
            return {
                date: record.date,
                status: studentRecord.status,
                remarks: studentRecord.remarks
            };
        });

        res.status(200).json({ success: true, history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
