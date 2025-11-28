const express = require('express');
const router = express.Router();
const {
    getMyCertificates,
    getCertificate,
    verifyCertificate,
    getCourseCertificates,
} = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Student routes
router.get('/my-certificates', protect, authorize('student'), getMyCertificates);

// Public routes (for verification)
router.get('/verify/:certificateId', verifyCertificate);
router.get('/:id', getCertificate);

// Teacher routes
router.get('/course/:courseId', protect, authorize('teacher', 'admin'), getCourseCertificates);

module.exports = router;
