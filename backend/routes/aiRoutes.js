const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Assuming auth middleware exists
const { generateStudyPlan, generatePracticeQuiz } = require('../controllers/aiController');

router.post('/study-plan', protect, generateStudyPlan);
router.post('/practice-quiz', protect, generatePracticeQuiz);

module.exports = router;
