const express = require('express');
const router = express.Router();
const {
    createAssignment,
    getCourseAssignments,
    getMyPendingAssignments,
    getMyAssignments,
    submitAssignment,
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

router.post('/', protect, authorize('teacher', 'admin'), upload.array('attachments'), createAssignment);
router.get('/course/:courseId', protect, getCourseAssignments);
router.get('/my-assignments', protect, authorize('student'), getMyAssignments);
router.get('/my-pending', protect, authorize('student'), getMyPendingAssignments);
router.post('/:id/submit', protect, authorize('student'), upload.array('attachments'), submitAssignment);

module.exports = router;
