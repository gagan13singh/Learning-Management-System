const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Get student's certificates
// @route   GET /api/certificates/my-certificates
// @access  Private (Student)
exports.getMyCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.find({ student: req.user.id })
            .populate('course', 'title category class')
            .populate('student', 'name email')
            .sort({ issueDate: -1 });

        res.status(200).json({
            success: true,
            count: certificates.length,
            data: certificates,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get single certificate
// @route   GET /api/certificates/:id
// @access  Public (for verification)
exports.getCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id)
            .populate('student', 'name email')
            .populate('course', 'title category class instructor');

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found',
            });
        }

        res.status(200).json({
            success: true,
            data: certificate,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Verify certificate by certificate ID
// @route   GET /api/certificates/verify/:certificateId
// @access  Public
exports.verifyCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findOne({ certificateId: req.params.certificateId })
            .populate('student', 'name email')
            .populate('course', 'title category class');

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found or invalid',
                verified: false,
            });
        }

        res.status(200).json({
            success: true,
            verified: true,
            data: {
                certificateId: certificate.certificateId,
                studentName: certificate.student.name,
                courseName: certificate.course.title,
                issueDate: certificate.issueDate,
                isVerified: certificate.isVerified,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get all certificates for a course (Teacher)
// @route   GET /api/certificates/course/:courseId
// @access  Private (Teacher - own course only)
exports.getCourseCertificates = async (req, res) => {
    try {
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
                message: 'Not authorized to view course certificates',
            });
        }

        const certificates = await Certificate.find({ course: req.params.courseId })
            .populate('student', 'name email')
            .sort({ issueDate: -1 });

        res.status(200).json({
            success: true,
            count: certificates.length,
            data: certificates,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getMyCertificates: exports.getMyCertificates,
    getCertificate: exports.getCertificate,
    verifyCertificate: exports.verifyCertificate,
    getCourseCertificates: exports.getCourseCertificates,
};
