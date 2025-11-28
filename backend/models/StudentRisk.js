const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['behavioral', 'academic', 'attendance', 'other'],
        required: true,
    },
    description: String,
    severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
    date: {
        type: Date,
        default: Date.now,
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
});

const noteSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const studentRiskSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    riskLevel: {
        type: String,
        enum: ['none', 'at-risk', 'critical'],
        default: 'none',
    },
    attendancePercentage: {
        type: Number,
        default: 100,
    },
    testAverage: {
        type: Number,
        default: 0,
    },
    factors: [{
        type: String,
        description: String,
    }],
    lastCalculated: {
        type: Date,
        default: Date.now,
    },
    notes: [noteSchema],
    incidents: [incidentSchema],
}, {
    timestamps: true,
});

// Index for faster queries
studentRiskSchema.index({ riskLevel: 1, lastCalculated: -1 });
studentRiskSchema.index({ student: 1 });

module.exports = mongoose.model('StudentRisk', studentRiskSchema);
