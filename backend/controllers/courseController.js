const Course = require('../models/Course');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Teacher only)
exports.createCourse = async (req, res) => {
    try {
        const { title, description, category, class: courseClass, difficulty, tags, language, price } = req.body;

        const course = await Course.create({
            title,
            description,
            instructor: req.user.id,
            category,
            class: courseClass,
            difficulty,
            tags,
            language,
            price: price || 0,
        });

        // Add course to teacher's createdCourses
        await User.findByIdAndUpdate(req.user.id, {
            $push: { createdCourses: course._id },
        });

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: course,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getAllCourses = async (req, res) => {
    try {
        const { category, class: courseClass, difficulty, search, status } = req.query;

        // Build query
        let query = {};

        if (category) query.category = category;
        if (courseClass) query.class = courseClass;
        if (difficulty) query.difficulty = difficulty;
        if (status) {
            query.status = status;
        } else {
            // By default, only show published courses to public
            query.status = 'published';
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const courses = await Course.find(query)
            .populate('instructor', 'name email profilePicture')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name email profilePicture bio');

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found',
            });
        }

        res.status(200).json({
            success: true,
            data: course,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get courses created by logged-in teacher
// @route   GET /api/courses/my-courses
// @access  Private (Teacher only)
exports.getMyCourses = async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Teacher - own course only)
exports.updateCourse = async (req, res) => {
    try {
        let course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found',
            });
        }

        // Check if user is course instructor
        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this course',
            });
        }

        course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            data: course,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Teacher - own course only)
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found',
            });
        }

        // Check if user is course instructor
        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this course',
            });
        }

        await course.deleteOne();

        // Remove from teacher's createdCourses
        await User.findByIdAndUpdate(req.user.id, {
            $pull: { createdCourses: course._id },
        });

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Add module to course
// @route   POST /api/courses/:id/modules
// @access  Private (Teacher - own course only)
exports.addModule = async (req, res) => {
    try {
        const { title, description, order } = req.body;

        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found',
            });
        }

        // Check authorization
        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to modify this course',
            });
        }

        course.modules.push({
            title,
            description,
            order: order || course.modules.length,
            lectures: [],
        });

        await course.save();

        res.status(201).json({
            success: true,
            message: 'Module added successfully',
            data: course,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Add lecture to module
// @route   POST /api/courses/:courseId/modules/:moduleId/lectures
// @access  Private (Teacher - own course only)
exports.addLecture = async (req, res) => {
    try {
        const { title, description, videoUrl, videoPublicId, duration, order, resources, type, content } = req.body;

        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found',
            });
        }

        // Check authorization
        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to modify this course',
            });
        }

        const module = course.modules.id(req.params.moduleId);

        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Module not found',
            });
        }

        module.lectures.push({
            title,
            description,
            videoUrl,
            videoPublicId,
            duration,
            order: order || module.lectures.length,
            resources: resources || [],
            type: type || 'video',
            content,
        });

        await course.save();

        res.status(201).json({
            success: true,
            message: 'Lecture added successfully',
            data: course,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Upload video to Cloudinary
// @route   POST /api/courses/upload-video
// @access  Private (Teacher only)
exports.uploadVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a video file',
            });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: 'video',
            folder: 'lms-videos',
            chunk_size: 6000000, // 6MB chunks
        });

        // Delete local file
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            success: true,
            message: 'Video uploaded successfully',
            data: {
                videoUrl: result.secure_url,
                videoPublicId: result.public_id,
                duration: result.duration,
            },
        });
    } catch (error) {
        // Delete local file if upload fails
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Upload thumbnail
// @route   POST /api/courses/upload-thumbnail
// @access  Private (Teacher only)
exports.uploadThumbnail = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image file',
            });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: 'image',
            folder: 'lms-thumbnails',
            transformation: [
                { width: 800, height: 450, crop: 'fill' },
            ],
        });

        // Delete local file
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            success: true,
            message: 'Thumbnail uploaded successfully',
            data: {
                thumbnailUrl: result.secure_url,
            },
        });
    } catch (error) {
        // Delete local file if upload fails
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Publish/Unpublish course
// @route   PUT /api/courses/:id/publish
// @access  Private (Teacher - own course only)
exports.togglePublish = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found',
            });
        }

        // Check authorization
        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to modify this course',
            });
        }

        course.status = course.status === 'published' ? 'draft' : 'published';
        await course.save();

        res.status(200).json({
            success: true,
            message: `Course ${course.status === 'published' ? 'published' : 'unpublished'} successfully`,
            data: course,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
