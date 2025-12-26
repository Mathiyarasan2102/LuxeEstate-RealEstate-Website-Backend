const express = require('express');
const router = express.Router();
const {
    toggleWishlist,
    getWishlist,
    getUsers,
    deleteUser,
    updateUserRole,
    getUserProfile,
    updateUserProfile,
    applyForSeller,
    rejectSellerApplication
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/wishlist').get(protect, getWishlist);
router.route('/wishlist/:propertyId').put(protect, toggleWishlist);
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);
router.route('/apply-seller').post(protect, applyForSeller);

// Admin Routes
router.route('/')
    .get(protect, authorize('admin'), getUsers);

router.route('/:id')
    .delete(protect, authorize('admin'), deleteUser);

router.route('/:id/role')
    .put(protect, authorize('admin'), updateUserRole);

router.route('/:id/reject-seller')
    .put(protect, authorize('admin'), rejectSellerApplication);

module.exports = router;
