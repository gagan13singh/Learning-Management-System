const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Assignment = require('../models/Assignment');
const Announcement = require('../models/Announcement');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Basic Counts
        const totalUsers = await User.countDocuments();
        const activeStudents = await User.countDocuments({ role: 'student', isActive: true });
        const totalCourses = await Course.countDocuments();
        const publishedCourses = await Course.countDocuments({ status: 'published' });
        const totalEnrollments = await Enrollment.countDocuments();

        const instructors = await User.find({ role: 'teacher' }).select('name email createdCourses');

        // 2. User Growth (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const userGrowth = await User.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 3. Course Categories
        const courseCategories = await Course.aggregate([
            { $match: { status: 'published' } },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            }
        ]);

        // 4. Recent Enrollments
        const recentEnrollments = await Enrollment.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email')
            .populate('course', 'title price');

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activeStudents,
                totalCourses,
                publishedCourses,
                totalEnrollments,
                instructorsCount: instructors.length,
                userGrowth,
                courseCategories,
                recentEnrollments
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const { role, search } = req.query;
        let query = {};

        if (role) {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update user status (Block/Deactivate)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = async (req, res) => {
    try {
        const { isActive } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.isActive = isActive;
        await user.save();

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!['student', 'teacher', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        user.role = role;
        await user.save();

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get all courses with filtering
// @route   GET /api/admin/courses
// @access  Private/Admin
exports.getAllCourses = async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = {};

        if (status && status !== 'all') {
            query.status = status; // 'published' or 'draft'
        }

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const courses = await Course.find(query)
            .populate('instructor', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update course status (Approve/Reject)
// @route   PUT /api/admin/courses/:id/status
// @access  Private/Admin
exports.updateCourseStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        if (!['published', 'draft'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        course.status = status;
        await course.save();

        res.status(200).json({
            success: true,
            data: course
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Delete course (Admin Override)
// @route   DELETE /api/admin/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        await Course.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get all platform content (Videos, Documents)
// @route   GET /api/admin/content
// @access  Private/Admin
exports.getAllContent = async (req, res) => {
    try {
        let content = [];
        const { search } = req.query;

        // 1. Get Course Content (Lectures & Resources)
        const courses = await Course.find()
            .select('title modules instructor')
            .populate('instructor', 'name');

        courses.forEach(course => {
            course.modules.forEach(module => {
                module.lectures.forEach(lecture => {
                    // Lecture Content
                    if (lecture.videoUrl) {
                        if (!search || lecture.title.toLowerCase().includes(search.toLowerCase())) {
                            content.push({
                                _id: lecture._id,
                                title: lecture.title,
                                type: 'lecture-video',
                                url: lecture.videoUrl,
                                source: `Course: ${course.title} (Module: ${module.title})`,
                                instructor: course.instructor?.name,
                                parentId: course._id,
                                moduleId: module._id,
                                uploadedAt: lecture.createdAt
                            });
                        }
                    }
                    // Lecture Resources
                    if (lecture.resources && lecture.resources.length > 0) {
                        lecture.resources.forEach(res => {
                            if (!search || res.title.toLowerCase().includes(search.toLowerCase())) {
                                content.push({
                                    _id: res._id,
                                    title: res.title,
                                    type: `resource-${res.fileType || 'file'}`,
                                    url: res.fileUrl,
                                    source: `Course: ${course.title} (Lecture: ${lecture.title})`,
                                    instructor: course.instructor?.name,
                                    parentId: course._id,
                                    moduleId: module._id,
                                    lectureId: lecture._id,
                                    uploadedAt: lecture.createdAt // approximate
                                });
                            }
                        });
                    }
                });
            });
        });

        // 2. Get Assignment Content (Attachments)
        const assignments = await Assignment.find()
            .select('title attachments course createdBy')
            .populate('course', 'title')
            .populate('createdBy', 'name');

        assignments.forEach(assign => {
            if (assign.attachments && assign.attachments.length > 0) {
                assign.attachments.forEach(att => {
                    if (!search || att.name.toLowerCase().includes(search.toLowerCase())) {
                        content.push({
                            _id: att._id,
                            title: att.name,
                            type: 'assignment-file',
                            url: att.url,
                            source: `Assignment: ${assign.title} (${assign.course?.title})`,
                            instructor: assign.createdBy?.name,
                            parentId: assign._id,
                            uploadedAt: assign.createdAt
                        });
                    }
                });
            }
        });

        content.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

        res.status(200).json({
            success: true,
            count: content.length,
            data: content
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Delete content
// @route   DELETE /api/admin/content
// @access  Private/Admin
exports.deleteContent = async (req, res) => {
    try {
        const { type, id, parentId, moduleId, lectureId } = req.body;

        if (type === 'lecture-video') {
            const course = await Course.findById(parentId);
            if (course) {
                const module = course.modules.id(moduleId);
                const lecture = module ? module.lectures.id(id) : null;
                if (lecture) {
                    lecture.videoUrl = undefined;
                    lecture.videoPublicId = undefined;
                    await course.save();
                }
            }
        } else if (type.startsWith('resource-')) {
            const course = await Course.findById(parentId);
            if (course) {
                const module = course.modules.id(moduleId);
                const lecture = module ? module.lectures.id(lectureId) : null;
                if (lecture && lecture.resources) {
                    lecture.resources = lecture.resources.filter(r => r._id.toString() !== id);
                    await course.save();
                }
            }
        } else if (type === 'assignment-file') {
            const assignment = await Assignment.findById(parentId);
            if (assignment && assignment.attachments) {
                assignment.attachments = assignment.attachments.filter(a => a._id.toString() !== id);
                await assignment.save();
            }
        }

        res.status(200).json({
            success: true,
            message: 'Content removed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Create a new announcement
// @route   POST /api/admin/announcements
// @access  Private/Admin
exports.createAnnouncement = async (req, res) => {
    try {
        const { title, message, target, type } = req.body;

        const announcement = await Announcement.create({
            title,
            message,
            target,
            type,
            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            data: announcement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get all announcements
// @route   GET /api/admin/announcements
// @access  Private/Admin
exports.getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({ isActive: true })
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name');

        res.status(200).json({
            success: true,
            count: announcements.length,
            data: announcements
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Delete announcement
// @route   DELETE /api/admin/announcements/:id
// @access  Private/Admin
exports.deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        await Announcement.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Announcement deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
