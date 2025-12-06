const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    createBatch,
    getAllBatches,
    getBatchById,
    updateBatch,
    deleteBatch,
    addStudentsToBatch,
    getBatchHealth,
    addStudentToBatch
} = require('../controllers/batchController');
/* const {
    markAttendance,
    getBatchAttendance,
    getStudentAttendance
} = require('../controllers/attendanceController'); */
const {
    getStudentBehaviour,
    getParentUpdateReport,
    getTeacherStats
} = require('../controllers/analyticsController');
const {
    createTest,
    getTests,
    getTestById,
    updateTestResults,
    updateTest,
    deleteTest,
    startQuiz,
    getAttempt,
    submitAnswer,
    logViolation,
    submitQuiz,
    getQuizResults
} = require('../controllers/testController');

// Batch Routes
router.post('/batches', protect, authorize('admin', 'teacher'), createBatch);
router.get('/batches', protect, getAllBatches);
router.get('/batches/:id', protect, getBatchById);
router.put('/batches/:id', protect, authorize('admin', 'teacher'), updateBatch);
router.delete('/batches/:id', protect, authorize('admin', 'teacher'), deleteBatch);
router.post('/batches/add-students', protect, authorize('admin', 'teacher'), addStudentsToBatch);
router.post('/batches/add-student', protect, authorize('admin', 'teacher'), addStudentToBatch);
router.get('/batches/:id/health', protect, authorize('admin', 'teacher'), getBatchHealth);

// Attendance Routes
// router.post('/attendance', protect, authorize('admin', 'teacher'), markAttendance);
// router.get('/attendance/batch/:batchId', protect, authorize('admin', 'teacher'), getBatchAttendance);
// router.get('/attendance/student/:studentId', protect, getStudentAttendance);

// Analytics Routes
router.get('/analytics/behaviour/:studentId', protect, authorize('admin', 'teacher'), getStudentBehaviour);
router.get('/analytics/parent-report/:studentId', protect, authorize('admin', 'teacher'), getParentUpdateReport);
router.get('/analytics/teacher-stats', protect, authorize('admin', 'teacher'), getTeacherStats);

// Test Routes
router.post('/tests', protect, authorize('admin', 'teacher'), createTest);
router.get('/tests', protect, getTests);
router.get('/tests/:id', protect, getTestById);
router.put('/tests/:id', protect, authorize('admin', 'teacher'), updateTest);
router.delete('/tests/:id', protect, authorize('admin', 'teacher'), deleteTest);
router.put('/tests/:id/results', protect, authorize('admin', 'teacher'), updateTestResults);

// Online Quiz Routes
router.post('/tests/:id/start', protect, authorize('student'), startQuiz);
router.get('/tests/:id/attempt', protect, authorize('student'), getAttempt);
router.put('/tests/:id/answer', protect, authorize('student'), submitAnswer);
router.post('/tests/:id/violation', protect, authorize('student'), logViolation);
router.post('/tests/:id/submit', protect, authorize('student'), submitQuiz);
router.get('/tests/:id/quiz-results', protect, authorize('admin', 'teacher'), getQuizResults);

module.exports = router;
