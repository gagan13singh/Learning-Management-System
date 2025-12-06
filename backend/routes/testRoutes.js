const express = require('express');
const router = express.Router();
const {
    createTest,
    getTests,
    getTestById,
    updateTest,
    deleteTest,
    getUpcomingTests,
    getStudentTestResults,
    // Quiz ones
    startQuiz,
    getAttempt,
    submitAnswer,
    submitQuiz,
    logViolation,
    getQuizResults,
    updateTestResults
} = require('../controllers/testController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Student specific routes (Priority)
router.get('/upcoming', protect, authorize('student'), getUpcomingTests);
router.get('/my-results', protect, authorize('student'), getStudentTestResults);

// General/Teacher routes
router.post('/', protect, authorize('teacher', 'admin'), createTest);
router.get('/', protect, getTests);
router.get('/:id', protect, getTestById);
router.put('/:id', protect, authorize('teacher', 'admin'), updateTest);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteTest);
router.put('/:id/results', protect, authorize('teacher', 'admin'), updateTestResults);

// Online Quiz Routes
router.post('/:id/start', protect, authorize('student'), startQuiz);
router.get('/:id/attempt', protect, authorize('student'), getAttempt);
router.post('/:id/answer', protect, authorize('student'), submitAnswer);
router.post('/:id/submit', protect, authorize('student'), submitQuiz);
router.post('/:id/violation', protect, authorize('student'), logViolation);
router.get('/:id/quiz-results', protect, authorize('teacher', 'admin'), getQuizResults);

module.exports = router;
