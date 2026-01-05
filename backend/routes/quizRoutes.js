const express = require('express');
const router = express.Router();
const {
    createQuiz,
    getQuizzesByCourse,
    getQuiz,
    getQuizFull,
    submitQuiz,
    getMyAttempts,
    getMyAllAttempts,
    getQuizAnalytics,
    updateQuiz,
    deleteQuiz,
    getTeacherQuizzes
} = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Teacher routes
router.get('/teacher/my-quizzes', protect, authorize('teacher', 'admin'), getTeacherQuizzes);
router.post('/', protect, authorize('teacher', 'admin'), createQuiz);
router.get('/:id/full', protect, authorize('teacher', 'admin'), getQuizFull);
router.get('/:id/analytics', protect, authorize('teacher', 'admin'), getQuizAnalytics);
router.put('/:id', protect, authorize('teacher', 'admin'), updateQuiz);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteQuiz);

// Student routes
router.get('/course/:courseId', protect, getQuizzesByCourse);
router.get('/:id', protect, getQuiz);
router.post('/:id/submit', protect, authorize('student'), submitQuiz);
router.get('/my-attempts/all', protect, getMyAllAttempts);
router.get('/:id/attempts', protect, getMyAttempts);

module.exports = router;
