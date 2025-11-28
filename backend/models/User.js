const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false, // Don't return password by default
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student',
    },
    profilePicture: {
        type: String,
        default: '',
    },
    phone: {
        type: String,
        default: '',
    },
    enrolledCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
    }],
    createdCourses: [{ // For teachers
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
    }],
    batches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
    }],
    parentEmail: {
        type: String,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    parentPhone: {
        type: String,
    },
    behaviourScore: {
        type: Number,
        default: 100, // Starts perfect
        min: 0,
        max: 100,
    },
    riskStatus: {
        type: String,
        enum: ['Consistent', 'Risk', 'Critical'],
        default: 'Consistent',
    },
    bio: {
        type: String,
        default: '',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function () {
    return {
        _id: this._id,
        name: this.name,
        email: this.email,
        role: this.role,
        profilePicture: this.profilePicture,
        bio: this.bio,
    };
};

module.exports = mongoose.model('User', userSchema);
