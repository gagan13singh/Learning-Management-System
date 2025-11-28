const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
    refreshToken,
    getAllStudents,
    bulkRegister,
    deleteUser,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/refresh-token', refreshToken);
router.get('/students', protect, authorize('teacher', 'admin'), getAllStudents);
router.post('/bulk-register', protect, authorize('teacher', 'admin'), bulkRegister);
router.delete('/users/:id', protect, authorize('teacher', 'admin'), deleteUser);

module.exports = router;
