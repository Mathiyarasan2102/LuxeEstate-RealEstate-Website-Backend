const express = require('express');
const router = express.Router();
const {
    getProperties,
    getProperty,
    getAgentProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    publishProperty,
    getPropertyStats,
    getAdminProperties,
    uploadImages
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// 1. Static/Specific Routes (Must come BEFORE /:id or /:slug)
router.route('/').get(getProperties);
router.route('/agent/my-listings').get(protect, authorize('agent', 'admin'), getAgentProperties);
router.route('/admin/all').get(protect, authorize('admin'), getAdminProperties);
router.route('/upload').post(protect, authorize('agent', 'admin'), upload.array('images', 10), uploadImages);
router.route('/').post(protect, authorize('agent', 'admin'), createProperty);

// 2. Parameterized Routes
// We use :id for both ID and Slug lookups as controller handles both
router.route('/:id')
    .get(getProperty)
    .put(protect, authorize('agent', 'admin'), updateProperty)
    .delete(protect, authorize('agent', 'admin'), deleteProperty);

router.route('/:id/publish').post(protect, authorize('agent', 'admin'), publishProperty);
router.route('/:id/stats').get(protect, authorize('agent', 'admin'), getPropertyStats);
router.route('/:id/stats').get(protect, authorize('agent', 'admin'), getPropertyStats);

module.exports = router;
