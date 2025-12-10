const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const User = require('../models/User');
const Certificate = require('../models/Certificate');

// @desc    Enroll in a course
// @route   POST /api/enrollments/:courseId
// @access  Private (Student)
exports.enrollCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found',
            });
        }

        if (course.status !== 'published') {
            return res.status(400).json({
                success: false,
                message: 'This course is not available for enrollment',
            });
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({
            student: req.user.id,
            course: req.params.courseId,
        });

        if (existingEnrollment) {
            return res.status(400).json({
                success: false,
                message: 'You are already enrolled in this course',
            });
        }

        // Create enrollment
        const enrollment = await Enrollment.create({
            student: req.user.id,
            course: req.params.courseId,
        });

        // Update course enrollment count
        course.enrollmentCount += 1;
        await course.save();

        // Add to user's enrolledCourses
        await User.findByIdAndUpdate(req.user.id, {
            $push: { enrolledCourses: course._id },
        });

        res.status(201).json({
            success: true,
            message: 'Successfully enrolled in course',
            data: enrollment,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get enrolled courses
// @route   GET /api/enrollments/my-courses
// @access  Private (Student)
exports.getEnrolledCourses = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student: req.user.id })
            .populate({
                path: 'course',
                populate: {
                    path: 'instructor',
                    select: 'name email profilePicture',
                },
            })
            .sort({ enrollmentDate: -1 });

        res.status(200).json({
            success: true,
            count: enrollments.length,
            data: enrollments,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get single enrollment details
// @route   GET /api/enrollments/:courseId
// @access  Private (Student)
exports.getEnrollment = async (req, res) => {
    try {
        const enrollment = await Enrollment.findOne({
            student: req.user.id,
            course: req.params.courseId,
        }).populate('course');

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found',
            });
        }

        res.status(200).json({
            success: true,
            data: enrollment,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update video progress
// @route   POST /api/enrollments/progress
// @access  Private (Student)
exports.updateProgress = async (req, res) => {
    try {
        console.log('updateProgress called with:', req.body);
        console.log('User:', req.user);
        const { courseId, moduleId, lectureId, watchTime, lastWatchedPosition, duration } = req.body;

        // Calculate completion percentage
        const completionPercentage = duration > 0 ? Math.min((watchTime / duration) * 100, 100) : 0;
        const isCompleted = completionPercentage >= 90; // Consider 90% as completed

        // Update or create progress
        let progress = await Progress.findOne({
            student: req.user.id,
            course: courseId,
            lectureId,
        });

        if (progress) {
            progress.watchTime = watchTime;
            progress.lastWatchedPosition = lastWatchedPosition;
            progress.completionPercentage = completionPercentage;
            progress.isCompleted = isCompleted;
            progress.lastAccessedAt = new Date();
            await progress.save();
        } else {
            progress = await Progress.create({
                student: req.user.id,
                course: courseId,
                moduleId,
                lectureId,
                watchTime,
                lastWatchedPosition,
                completionPercentage,
                isCompleted,
            });
        }

        // If lecture is completed, update enrollment
        if (isCompleted) {
            const enrollment = await Enrollment.findOne({
                student: req.user.id,
                course: courseId,
            });

            if (enrollment) {
                // Check if lecture already marked as completed
                const alreadyCompleted = enrollment.completedLectures.some(
                    cl => String(cl.lectureId) === String(lectureId)
                );

                if (!alreadyCompleted) {
                    enrollment.completedLectures.push({
                        moduleId: String(moduleId),
                        lectureId: String(lectureId),
                        completedAt: new Date(),
                    });

                    // Calculate overall progress
                    const course = await Course.findById(courseId);
                    const totalLectures = course.modules.reduce(
                        (total, module) => total + module.lectures.length,
                        0
                    );
                    enrollment.progress = (enrollment.completedLectures.length / totalLectures) * 100;

                    await enrollment.save();

                    // Check if course is completed (all lectures watched)
                    if (enrollment.progress >= 100) {
                        await checkAndGenerateCertificate(req.user.id, courseId);
                    }
                }
            }
        }

        res.status(200).json({
            success: true,
            message: 'Progress updated successfully',
            data: progress,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get progress for a course
// @route   GET /api/enrollments/:courseId/progress
// @access  Private (Student)
exports.getCourseProgress = async (req, res) => {
    try {
        const progress = await Progress.find({
            student: req.user.id,
            course: req.params.courseId,
        });

        const enrollment = await Enrollment.findOne({
            student: req.user.id,
            course: req.params.courseId,
        });

        res.status(200).json({
            success: true,
            data: {
                progress,
                enrollment,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get students enrolled in a course (for teachers)
// @route   GET /api/enrollments/course/:courseId/students
// @access  Private (Teacher - own course only)
exports.getCourseStudents = async (req, res) => {
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
                message: 'Not authorized to view course students',
            });
        }

        const enrollments = await Enrollment.find({ course: req.params.courseId })
            .populate('student', 'name email profilePicture')
            .sort({ enrollmentDate: -1 });

        res.status(200).json({
            success: true,
            count: enrollments.length,
            data: enrollments,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Helper function to check and generate certificate
async function checkAndGenerateCertificate(studentId, courseId) {
    try {
        const enrollment = await Enrollment.findOne({
            student: studentId,
            course: courseId,
        });

        // Check if certificate already exists
        if (enrollment.certificate) {
            return;
        }

        // Check if all requirements are met (100% progress)
        if (enrollment.progress >= 100) {
            const certificate = await Certificate.create({
                student: studentId,
                course: courseId,
                completionPercentage: enrollment.progress,
            });

            enrollment.certificate = certificate._id;
            enrollment.status = 'completed';
            await enrollment.save();

            console.log(`✅ Certificate generated for student ${studentId} in course ${courseId}`);
        }
    } catch (error) {
        console.error('Error generating certificate:', error);
    }
}

module.exports = {
    enrollCourse: exports.enrollCourse,
    getEnrolledCourses: exports.getEnrolledCourses,
    getEnrollment: exports.getEnrollment,
    updateProgress: exports.updateProgress,
    getCourseProgress: exports.getCourseProgress,
    getCourseStudents: exports.getCourseStudents,
};
