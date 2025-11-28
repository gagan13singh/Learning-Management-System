const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
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
    certificateId: {
        type: String,
        required: true,
        unique: true,
    },
    issueDate: {
        type: Date,
        default: Date.now,
    },
    pdfUrl: {
        type: String,
        default: '',
    },
    isVerified: {
        type: Boolean,
        default: true,
    },
    grade: {
        type: String,
        default: 'Pass',
    },
    completionPercentage: {
        type: Number,
        default: 100,
    },
}, {
    timestamps: true,
});

// Generate unique certificate ID before saving
certificateSchema.pre('save', async function (next) {
    if (!this.certificateId) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.certificateId = `CERT-${timestamp}-${random}`;
    }
    next();
});

module.exports = mongoose.model('Certificate', certificateSchema);
