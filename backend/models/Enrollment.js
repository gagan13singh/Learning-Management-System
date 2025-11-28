const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
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
    enrollmentDate: {
        type: Date,
        default: Date.now,
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    completedLectures: [{
        moduleId: String,
        lectureId: String,
        completedAt: Date,
    }],
    completedQuizzes: [{
        quizId: mongoose.Schema.Types.ObjectId,
        completedAt: Date,
        score: Number,
    }],
    certificate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Certificate',
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'dropped'],
        default: 'active',
    },
    lastAccessedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Compound index to prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Update lastAccessedAt on save
enrollmentSchema.pre('save', function (next) {
    this.lastAccessedAt = new Date();
    next();
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
