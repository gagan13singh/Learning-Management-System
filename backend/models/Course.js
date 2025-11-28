const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    videoUrl: {
        type: String,
    },
    type: {
        type: String,
        enum: ['video', 'text', 'quiz'],
        default: 'video',
    },
    content: {
        type: String, // For text-based lectures/notes
    },
    videoPublicId: { // Cloudinary public ID for deletion
        type: String,
    },
    duration: {
        type: Number, // in seconds
        default: 0,
    },
    // Lecture Planner Fields
    scheduledDate: {
        type: Date,
    },
    homework: {
        description: String,
        fileUrl: String,
    },
    notes: {
        fileUrl: String,
    },
    isCompleted: { // For tracking if lecture is done
        type: Boolean,
        default: false,
    },
    order: {
        type: Number,
        default: 0,
    },
    resources: [{
        title: String,
        fileUrl: String,
        fileType: String, // pdf, doc, etc.
    }],
}, {
    timestamps: true,
});

const moduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    order: {
        type: Number,
        default: 0,
    },
    lectures: [lectureSchema],
}, {
    timestamps: true,
});

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a course title'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please provide a course description'],
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Social Studies', 'Computer Science', 'Other'],
    },
    class: {
        type: String,
        required: true,
        enum: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Other'],
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner',
    },
    thumbnail: {
        type: String,
        default: '',
    },
    price: {
        type: Number,
        default: 0, // 0 means free
    },
    modules: [moduleSchema],
    batches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
    }],
    tags: [{
        type: String,
    }],
    enrollmentCount: {
        type: Number,
        default: 0,
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    totalRatings: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft',
    },
    language: {
        type: String,
        default: 'English',
    },
}, {
    timestamps: true,
});

// Virtual for total lectures
courseSchema.virtual('totalLectures').get(function () {
    if (!this.modules) return 0;
    return this.modules.reduce((total, module) => total + module.lectures.length, 0);
});

// Virtual for total duration
courseSchema.virtual('totalDuration').get(function () {
    if (!this.modules) return 0;
    return this.modules.reduce((total, module) => {
        return total + module.lectures.reduce((sum, lecture) => sum + lecture.duration, 0);
    }, 0);
});

// Ensure virtuals are included in JSON
courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema);
