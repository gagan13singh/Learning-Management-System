const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema({
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true,
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
    attachments: [{
        url: String,
        name: String,
        publicId: String,
    }],
    notes: {
        type: String,
    },
    score: {
        type: Number,
        min: 0,
    },
    feedback: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'submitted', 'graded'],
        default: 'submitted',
    },
    gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    gradedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

// Compound index to ensure one submission per student per assignment
assignmentSubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
