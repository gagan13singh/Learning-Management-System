const mongoose = require('mongoose');

const TestAttemptSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true
    },
    status: {
        type: String,
        enum: ['InProgress', 'Completed', 'Terminated', 'Timeout'],
        default: 'InProgress'
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: Date,
    answers: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question'
        },
        markedOptionIds: [String], // For MCQ/MSQ
        textAnswer: String, // For FillBlanks/Descriptive/Code
        timeSpent: Number, // Seconds spent on this question
        isCorrect: Boolean,
        marksObtained: Number
    }],
    // Anti-Cheating Logs
    proctoringLogs: [{
        violationType: {
            type: String,
            enum: ['TAB_SWITCH', 'FULLSCREEN_EXIT', 'WINDOW_FOCUS_LOST', 'SPLIT_SCREEN', 'COPY_PASTE', 'DEVICE_CHANGE', 'MULTIPLE_FACES']
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        evidence: String, // Description or Metadata
        snapshot: String // URL to evidence image (optional, if implementing no-screenshot policy this might be metadata only)
    }],
    fraudScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    riskLevel: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low'
    },
    totalScore: {
        type: Number,
        default: 0
    },
    feedback: String
});

// Middleware to auto-calculate risk level
TestAttemptSchema.pre('save', function (next) {
    if (this.fraudScore >= 50) this.riskLevel = 'High';
    else if (this.fraudScore >= 20) this.riskLevel = 'Medium';
    else this.riskLevel = 'Low';
    next();
});

module.exports = mongoose.model('TestAttempt', TestAttemptSchema);
