const express = require('express');
const router = express.Router();
const {
    markAttendance,
    getAttendanceSummary,
    getCourseAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/mark', protect, authorize('teacher', 'admin'), markAttendance);
router.get('/summary', protect, authorize('student'), getAttendanceSummary);
router.get('/course/:courseId', protect, authorize('teacher', 'admin'), getCourseAttendance);

module.exports = router;
