const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    message: {
        type: String,
        required: [true, 'Please provide a message'],
        maxlength: [500, 'Message cannot be more than 500 characters']
    },
    target: {
        type: String,
        enum: ['all', 'students', 'instructors'],
        default: 'all'
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'success', 'alert'],
        default: 'info'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: { // Can be used to soft delete or hide
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);
