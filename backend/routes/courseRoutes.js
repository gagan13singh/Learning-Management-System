const express = require('express');
const router = express.Router();
const {
    createCourse,
    getAllCourses,
    getCourse,
    getMyCourses,
    updateCourse,
    deleteCourse,
    addModule,
    addLecture,
    uploadVideo,
    uploadThumbnail,
    uploadPDF,
    togglePublish,
    updateLecture,
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

// Public routes
router.get('/', getAllCourses);
router.get('/:id', getCourse);

// Teacher routes
router.post('/', protect, authorize('teacher', 'admin'), createCourse);
router.get('/teacher/my-courses', protect, authorize('teacher', 'admin'), getMyCourses);
router.put('/:id', protect, authorize('teacher', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteCourse);

// Module and lecture management
router.post('/:id/modules', protect, authorize('teacher', 'admin'), addModule);
router.post('/:courseId/modules/:moduleId/lectures', protect, authorize('teacher', 'admin'), addLecture);
router.put('/:courseId/modules/:moduleId/lectures/:lectureId', protect, authorize('teacher', 'admin'), updateLecture);

// File uploads
router.post('/upload/video', protect, authorize('teacher', 'admin'), upload.single('video'), uploadVideo);
router.post('/upload/thumbnail', protect, authorize('teacher', 'admin'), upload.single('thumbnail'), uploadThumbnail);
router.post('/upload/pdf', protect, authorize('teacher', 'admin'), upload.single('pdf'), uploadPDF);

// Publish/Unpublish
router.put('/:id/publish', protect, authorize('teacher', 'admin'), togglePublish);

module.exports = router;
