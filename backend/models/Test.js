const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true,
    },
    questionType: {
        type: String,
        enum: ['MCQ', 'MULTIPLE_SELECT', 'TRUE_FALSE', 'FILL_BLANK'],
        default: 'MCQ',
    },
    options: [String],
    correctAnswer: String, // For MCQ, TRUE_FALSE, FILL_BLANK
    correctAnswers: [String], // For MULTIPLE_SELECT
    points: {
        type: Number,
        default: 1,
    },
    explanation: String, // Optional explanation for the answer
});

const testSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a test title'],
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    totalMarks: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['OBJECTIVE', 'SUBJECTIVE', 'PRACTICAL', 'VIVA', 'ONLINE_QUIZ'],
        default: 'SUBJECTIVE',
    },
    syllabus: {
        type: String,
        required: true,
    },

    // Online Quiz specific fields
    isOnlineQuiz: {
        type: Boolean,
        default: false,
    },
    timeLimit: {
        type: Number, // in minutes
        default: 60,
    },
    passingPercentage: {
        type: Number,
        default: 40,
        min: 0,
        max: 100,
    },
    randomizeQuestions: {
        type: Boolean,
        default: false,
    },
    randomizeOptions: {
        type: Boolean,
        default: false,
    },
    enableProctoring: {
        type: Boolean,
        default: true,
    },
    maxViolations: {
        type: Number,
        default: 2,
    },
    showResultsImmediately: {
        type: Boolean,
        default: true,
    },

    // Questions array (enhanced for online quizzes)
    questions: [questionSchema],

    // Results for offline tests (manual grading)
    results: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        marks: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['PRESENT', 'ABSENT'],
            default: 'PRESENT',
        },
    }],

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Virtual to calculate total points for online quizzes
testSchema.virtual('totalPoints').get(function () {
    if (!this.questions || this.questions.length === 0) return 0;
    return this.questions.reduce((total, q) => total + (q.points || 0), 0);
});

// Ensure virtuals are included in JSON
testSchema.set('toJSON', { virtuals: true });
testSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Test', testSchema);
