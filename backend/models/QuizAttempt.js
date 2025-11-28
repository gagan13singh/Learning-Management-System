const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true,
    },
    answers: [{
        questionId: mongoose.Schema.Types.ObjectId,
        selectedOptionIndex: Number,
        isCorrect: Boolean,
        marksObtained: Number,
    }],
    score: {
        type: Number,
        required: true,
    },
    totalMarks: {
        type: Number,
        required: true,
    },
    percentage: {
        type: Number,
        required: true,
    },
    passed: {
        type: Boolean,
        required: true,
    },
    timeTaken: {
        type: Number, // in seconds
    },
    attemptDate: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Index for faster queries
quizAttemptSchema.index({ student: 1, quiz: 1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
