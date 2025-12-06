const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Course = require('../models/Course');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private (Teacher)
exports.createAssignment = async (req, res) => {
    try {
        const { title, description, course, subject, dueDate, maxScore, type } = req.body;

        // Handle attachments if any
        let attachments = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    resource_type: 'auto',
                    folder: 'lms-assignments',
                });
                attachments.push({
                    url: result.secure_url,
                    name: file.originalname,
                    publicId: result.public_id,
                });
                fs.unlinkSync(file.path);
            }
        }

        const assignment = await Assignment.create({
            title,
            description,
            course,
            subject,
            dueDate,
            maxScore,
            type,
            attachments,
            createdBy: req.user.id,
        });

        res.status(201).json({
            success: true,
            data: assignment,
        });
    } catch (error) {
        if (req.files) {
            req.files.forEach(file => fs.unlinkSync(file.path));
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get assignments for a course
// @route   GET /api/assignments/course/:courseId
// @access  Private
exports.getCourseAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({ course: req.params.courseId })
            .sort({ dueDate: 1 });

        res.status(200).json({
            success: true,
            data: assignments,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get student's pending assignments
// @route   GET /api/assignments/my-pending
// @access  Private (Student)
exports.getMyPendingAssignments = async (req, res) => {
    try {
        // Find courses enrolled by student
        const Enrollment = require('../models/Enrollment');
        const enrollments = await Enrollment.find({ student: req.user.id, status: 'active' });
        const courseIds = enrollments.map(e => e.course);

        // Find assignments for these courses
        const assignments = await Assignment.find({
            course: { $in: courseIds },
            dueDate: { $gte: new Date() }
        }).sort({ dueDate: 1 });

        // Filter out submitted ones
        const submissions = await AssignmentSubmission.find({
            student: req.user.id,
            assignment: { $in: assignments.map(a => a._id) }
        });

        const submittedAssignmentIds = submissions.map(s => s.assignment.toString());
        const pendingAssignments = assignments.filter(a => !submittedAssignmentIds.includes(a._id.toString()));

        res.status(200).json({
            success: true,
            data: pendingAssignments,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private (Student)
exports.submitAssignment = async (req, res) => {
    try {
        const { notes } = req.body;
        const assignmentId = req.params.id;

        // Check if already submitted
        const existingSubmission = await AssignmentSubmission.findOne({
            assignment: assignmentId,
            student: req.user.id
        });

        if (existingSubmission) {
            return res.status(400).json({ success: false, message: 'Assignment already submitted' });
        }

        let attachments = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    resource_type: 'auto',
                    folder: 'lms-submissions',
                });
                attachments.push({
                    url: result.secure_url,
                    name: file.originalname,
                    publicId: result.public_id,
                });
                fs.unlinkSync(file.path);
            }
        }

        const submission = await AssignmentSubmission.create({
            assignment: assignmentId,
            student: req.user.id,
            notes,
            attachments,
            status: 'submitted'
        });

        res.status(201).json({
            success: true,
            data: submission,
        });
    } catch (error) {
        if (req.files) {
            req.files.forEach(file => fs.unlinkSync(file.path));
        }
        res.status(500).json({ success: false, message: error.message });
    }
};
