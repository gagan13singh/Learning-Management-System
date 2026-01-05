const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['MCQ', 'MSQ', 'TrueFalse', 'FillBlanks', 'Numerical', 'Descriptive', 'Match', 'AssertionReason', 'Code'],
        required: true,
        default: 'MCQ'
    },
    content: {
        text: { type: String, required: true },
        images: [String], // Array of image URLs
        codeSnippet: String, // For code-based questions
        language: String // For code questions (e.g., 'javascript', 'python')
    },
    options: [{
        id: String, // "A", "B", "1", "2"
        text: String,
        isCorrect: Boolean,
        matchPair: String // For 'Match' type (e.g., matches with option ID on the right)
    }],
    numericalConfig: {
        answer: Number,
        tolerance: { type: Number, default: 0 } // e.g. answer is 5, tolerance 0.1 accepts 4.9-5.1
    },
    marks: {
        type: Number,
        default: 1
    },
    negativeMarks: {
        type: Number,
        default: 0
    },
    complexity: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    tags: [String], // For filtering/random generation
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Question', QuestionSchema);
