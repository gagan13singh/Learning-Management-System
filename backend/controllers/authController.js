const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../middleware/authMiddleware');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email',
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'student',
            phone,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Bulk Register Students (CSV)
// @route   POST /api/auth/bulk-register
// @access  Private (Teacher/Admin)
exports.bulkRegister = async (req, res) => {
    try {
        const { students } = req.body; // Array of { name, email, password, phone }

        if (!students || !Array.isArray(students) || students.length === 0) {
            return res.status(400).json({ success: false, message: 'No students provided' });
        }

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        const createdUsers = [];

        for (const student of students) {
            try {
                // Check if exists
                const exists = await User.findOne({ email: student.email });
                if (exists) {
                    results.failed++;
                    results.errors.push(`${student.email}: Already exists`);
                    // If user exists, we might still want to add them to the batch?
                    // For now, let's assume we only add NEW users or we need to fetch existing user.
                    // Let's fetch the existing user to add to batch
                    createdUsers.push(exists);
                    continue;
                }

                const newUser = await User.create({
                    name: student.name,
                    email: student.email,
                    password: student.password || '123456', // Default password
                    role: 'student',
                    phone: student.phone
                });
                results.success++;
                createdUsers.push(newUser);
            } catch (err) {
                results.failed++;
                results.errors.push(`${student.email}: ${err.message}`);
            }
        }

        res.status(200).json({
            success: true,
            message: `Processed ${students.length} students`,
            results,
            users: createdUsers
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        // Check for user (include password for comparison)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Check if password matches
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Generate tokens
        const token = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: user.getPublicProfile(),
                token,
                refreshToken,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, bio, profilePicture } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Update fields
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (bio) user.bio = bio;
        if (profilePicture) user.profilePicture = profilePicture;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user.getPublicProfile(),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token required',
            });
        }

        // Verify refresh token
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Generate new access token
        const newToken = generateToken(decoded.id);

        res.status(200).json({
            success: true,
            data: {
                token: newToken,
            },
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid refresh token',
        });
    }
};

// @desc    Get all students
// @route   GET /api/auth/students
// @access  Private (Teacher/Admin)
exports.getAllStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('name email _id phone');
        res.status(200).json({
            success: true,
            data: students,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete User (Student)
// @route   DELETE /api/auth/users/:id
// @access  Private (Teacher/Admin)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Prevent deleting other teachers/admins unless admin
        if (user.role !== 'student' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this user' });
        }

        await user.deleteOne();

        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
