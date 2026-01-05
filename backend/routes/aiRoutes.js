const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Assuming auth middleware exists
const { generateStudyPlan, generatePracticeQuiz, generateDoubtResolution } = require('../controllers/aiController');

router.post('/study-plan', protect, generateStudyPlan);
router.post('/practice-quiz', protect, generatePracticeQuiz);
router.post('/resolve-doubt', protect, generateDoubtResolution);

module.exports = router;
