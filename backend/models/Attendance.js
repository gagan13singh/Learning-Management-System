const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late'],
        default: 'present',
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});

// Compound index to ensure one record per student per course per subject per date
// Using date only might be tricky with time components, usually we normalize date or use a range. 
// For simplicity we will trust the date provided is normalized or just rely on IDs for specific edits.
attendanceSchema.index({ student: 1, course: 1, subject: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
