const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a batch name'],
        trim: true,
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        index: true
    }],
    course: { // Legacy support
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        index: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    schedule: [{
        day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            required: true,
        },
        startTime: {
            type: String, // HH:MM format
            required: true,
        },
        endTime: {
            type: String, // HH:MM format
            required: true,
        },
    }],
    maxStrength: {
        type: Number,
        default: 30,
    },
    status: {
        type: String,
        enum: ['OPEN', 'FULL', 'LIMITED'],
        default: 'OPEN',
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
    },
    // Batch Health Metrics (Cached/Updated periodically)
    healthScore: {
        type: Number,
        default: 100,
        min: 0,
        max: 100,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Calculate status based on strength
batchSchema.pre('save', function (next) {
    if (this.students.length >= this.maxStrength) {
        this.status = 'FULL';
    } else if (this.students.length >= this.maxStrength * 0.8) {
        this.status = 'LIMITED';
    } else {
        this.status = 'OPEN';
    }
    next();
});

module.exports = mongoose.model('Batch', batchSchema);
