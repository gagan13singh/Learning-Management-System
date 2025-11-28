const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true,
    },
    options: [{
        type: String,
        required: true,
    }],
    correctOptionIndex: {
        type: Number,
        required: true,
        min: 0,
    },
    marks: {
        type: Number,
        default: 1,
    },
    explanation: {
        type: String,
        default: '',
    },
});

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    type: {
        type: String,
        enum: ['MCQ', 'Subjective', 'PDF'],
        default: 'MCQ',
    },
    pdfUrl: { // For PDF based tests
        type: String,
    },
    answerKeyUrl: { // For PDF/Subjective tests
        type: String,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    moduleId: {
        type: String, // ID of the module within the course
    },
    questions: [questionSchema],
    totalMarks: {
        type: Number,
        default: 0,
    },
    passingPercentage: {
        type: Number,
        default: 40,
        min: 0,
        max: 100,
    },
    timeLimit: {
        type: Number, // in minutes
        default: 30,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Calculate total marks before saving
quizSchema.pre('save', function (next) {
    this.totalMarks = this.questions.reduce((total, question) => total + question.marks, 0);
    next();
});

module.exports = mongoose.model('Quiz', quizSchema);
