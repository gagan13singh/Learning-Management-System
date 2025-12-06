const Announcement = require('../models/Announcement');
const Enrollment = require('../models/Enrollment');

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (Teacher)
exports.createAnnouncement = async (req, res) => {
    try {
        const { title, message, type, course, priority } = req.body;

        const announcement = await Announcement.create({
            title,
            message,
            type,
            course,
            priority,
            postedBy: req.user.id,
        });

        res.status(201).json({
            success: true,
            data: announcement,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get announcements for student
// @route   GET /api/announcements
// @access  Private
exports.getAnnouncements = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'student') {
            // Get global announcements OR course-specific ones for enrolled courses
            const enrollments = await Enrollment.find({ student: req.user.id, status: 'active' });
            const courseIds = enrollments.map(e => e.course);

            query = {
                $or: [
                    { course: null }, // Global
                    { course: { $in: courseIds } }
                ]
            };
        } else {
            // Teachers see what they posted or all? Let's say all for now or their courses
            query = {}; // Show all for teachers/admins
        }

        const announcements = await Announcement.find(query)
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('postedBy', 'name')
            .populate('course', 'title');

        res.status(200).json({
            success: true,
            data: announcements,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
