const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a test title'],
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    instructions: String,

    // Test Mode Configuration
    mode: {
        type: String,
        enum: ['Exam', 'Practice', 'Adaptive', 'Mock'],
        default: 'Exam'
    },

    // Time & Scoring Config
    config: {
        duration: { type: Number, required: true }, // in minutes
        totalMarks: Number,
        passingMarks: Number,
        isTimed: { type: Boolean, default: true },
        allowSectionSwitch: { type: Boolean, default: true },
        shuffleQuestions: { type: Boolean, default: false },
        showResultImmediately: { type: Boolean, default: true },
        negativeMarking: { type: Boolean, default: false }
    },

    // Anti-Cheating / Proctoring Configuration
    proctoring: {
        enabled: { type: Boolean, default: true },
        fullscreenRequired: { type: Boolean, default: true },
        tabSwitchLimit: { type: Number, default: 3 },
        preventCopyPaste: { type: Boolean, default: true },
        trackFocusLost: { type: Boolean, default: true }
    },

    // Questions (Referencing Question Bank)
    questions: [{
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        section: { type: String, default: 'General' },
        marks: Number // Override marks if needed
    }],

    // Metadata
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Virtual for question count
TestSchema.virtual('questionCount').get(function () {
    return this.questions ? this.questions.length : 0;
});

TestSchema.set('toJSON', { virtuals: true });
TestSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Test', TestSchema);
