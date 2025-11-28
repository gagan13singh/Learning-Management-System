const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now,
    },
    type: {
        type: String,
        enum: ['TAB_SWITCH', 'FULLSCREEN_EXIT', 'COPY_PASTE'],
        default: 'TAB_SWITCH',
    },
    description: String,
});

const answerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    answer: mongoose.Schema.Types.Mixed, // Can be String or Array for multiple select
    isCorrect: Boolean,
    pointsEarned: {
        type: Number,
        default: 0,
    },
    timeSpent: Number, // seconds spent on this question
});

const testAttemptSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true,
    },
    startTime: {
        type: Date,
        default: Date.now,
    },
    endTime: Date,
    submittedAt: Date,

    answers: [answerSchema],

    score: {
        type: Number,
        default: 0,
    },
    totalPoints: Number,
    percentage: {
        type: Number,
        default: 0,
    },
    passed: {
        type: Boolean,
        default: false,
    },

    violations: [violationSchema],
    violationCount: {
        type: Number,
        default: 0,
    },

    status: {
        type: String,
        enum: ['in-progress', 'completed', 'cancelled', 'expired'],
        default: 'in-progress',
    },

    // Randomized question order for this attempt
    questionOrder: [mongoose.Schema.Types.ObjectId],

    // IP address and user agent for security
    ipAddress: String,
    userAgent: String,
}, {
    timestamps: true,
});

// Index for faster queries
testAttemptSchema.index({ student: 1, test: 1 });
testAttemptSchema.index({ test: 1, status: 1 });

// Method to calculate score
testAttemptSchema.methods.calculateScore = function () {
    this.score = this.answers.reduce((total, answer) => total + (answer.pointsEarned || 0), 0);
    if (this.totalPoints > 0) {
        this.percentage = Math.round((this.score / this.totalPoints) * 100);
    }
    return this.score;
};

// Method to check if passed
testAttemptSchema.methods.checkPassed = function (passingPercentage) {
    this.passed = this.percentage >= passingPercentage;
    return this.passed;
};

module.exports = mongoose.model('TestAttempt', testAttemptSchema);
