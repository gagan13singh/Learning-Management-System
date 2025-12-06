const express = require('express');
const router = express.Router();
const {
    createAnnouncement,
    getAnnouncements
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('teacher', 'admin'), createAnnouncement);
router.get('/', protect, getAnnouncements);

module.exports = router;
