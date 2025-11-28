const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
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
    moduleId: {
        type: String,
        required: true,
    },
    lectureId: {
        type: String,
        required: true,
    },
    watchTime: {
        type: Number, // in seconds
        default: 0,
    },
    lastWatchedPosition: {
        type: Number, // in seconds
        default: 0,
    },
    completionPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    lastAccessedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Compound index for faster queries
progressSchema.index({ student: 1, course: 1, lectureId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
