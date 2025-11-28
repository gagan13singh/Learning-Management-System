const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getAtRiskStudents,
    getStudentInsights,
    calculateRisks,
    addNote,
    addIncident,
    getInsightsStats
} = require('../controllers/insightsController');
const {
    previewReport,
    sendReport,
    getReportHistory
} = require('../controllers/reportController');

// Insights Routes
router.get('/at-risk', protect, authorize('admin', 'teacher'), getAtRiskStudents);
router.get('/student/:id', protect, authorize('admin', 'teacher'), getStudentInsights);
router.post('/calculate', protect, authorize('admin', 'teacher'), calculateRisks);
router.post('/note', protect, authorize('admin', 'teacher'), addNote);
router.post('/incident', protect, authorize('admin', 'teacher'), addIncident);
router.get('/stats', protect, authorize('admin', 'teacher'), getInsightsStats);

// Report Routes
router.post('/reports/preview', protect, authorize('admin', 'teacher'), previewReport);
router.post('/reports/send', protect, authorize('admin', 'teacher'), sendReport);
router.get('/reports/history/:studentId', protect, authorize('admin', 'teacher'), getReportHistory);

module.exports = router;
