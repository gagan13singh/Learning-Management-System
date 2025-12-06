const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
    test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true,
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    marksObtained: {
        type: Number,
        required: true,
        min: 0,
    },
    percentage: {
        type: Number,
        required: true,
    },
    rank: {
        type: Number,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Compound index to ensure one result per student per test
testResultSchema.index({ test: 1, student: 1 }, { unique: true });

// Calculate percentage before saving
testResultSchema.pre('save', async function (next) {
    if (this.isModified('marksObtained')) {
        const test = await mongoose.model('Test').findById(this.test);
        if (test) {
            this.percentage = (this.marksObtained / test.maxMarks) * 100;
        }
    }
    next();
});

module.exports = mongoose.model('TestResult', testResultSchema);
