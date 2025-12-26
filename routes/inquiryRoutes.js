const express = require('express');
const router = express.Router();
const {
    createInquiry,
    getAgentInquiries,
    getUserInquiries,
    updateInquiryStatus,
    replyToInquiry
} = require('../controllers/inquiryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createInquiry);

router.route('/agent')
    .get(protect, authorize('agent', 'admin'), getAgentInquiries);

router.route('/my')
    .get(protect, getUserInquiries);

router.route('/:id')
    .put(protect, authorize('agent', 'admin'), updateInquiryStatus);

router.route('/:id/reply')
    .post(protect, authorize('agent', 'admin'), replyToInquiry);

module.exports = router;
