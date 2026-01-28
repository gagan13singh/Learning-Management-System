const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getDashboardStats,
    getAllUsers,
    updateUserStatus,
    updateUserRole,
    getAllCourses,
    updateCourseStatus,
    deleteCourse,
    getAllContent,
    deleteContent,
    createAnnouncement,
    getAnnouncements,
    deleteAnnouncement
} = require('../controllers/adminController');

// All routes are protected and require 'admin' role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);

router.get('/courses', getAllCourses);
router.put('/courses/:id/status', updateCourseStatus);
router.delete('/courses/:id', deleteCourse);

router.get('/content', getAllContent);
router.delete('/content', deleteContent);

router.post('/announcements', createAnnouncement);
router.get('/announcements', getAnnouncements);
router.delete('/announcements/:id', deleteAnnouncement);

module.exports = router;
