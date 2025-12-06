const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Assignment title is required'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Assignment description is required'],
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required'],
    },
    maxScore: {
        type: Number,
        required: true,
        default: 100,
    },
    attachments: [{
        url: String,
        name: String,
        publicId: String,
    }],
    type: {
        type: String,
        enum: ['homework', 'project', 'quiz', 'lab'],
        default: 'homework',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

// Index for faster queries
assignmentSchema.index({ course: 1, dueDate: 1 });
assignmentSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
