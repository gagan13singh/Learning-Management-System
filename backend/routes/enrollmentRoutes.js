const express = require('express');
const router = express.Router();
const {
    enrollCourse,
    getEnrolledCourses,
    getEnrollment,
    updateProgress,
    getCourseProgress,
    getCourseStudents,
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Student routes
router.post('/:courseId', protect, authorize('student'), enrollCourse);
router.get('/my-courses', protect, authorize('student'), getEnrolledCourses);
router.get('/:courseId', protect, authorize('student'), getEnrollment);
router.post('/progress', protect, authorize('student'), updateProgress);
router.get('/:courseId/progress', protect, authorize('student'), getCourseProgress);

// Teacher routes
router.get('/course/:courseId/students', protect, authorize('teacher', 'admin'), getCourseStudents);

module.exports = router;
