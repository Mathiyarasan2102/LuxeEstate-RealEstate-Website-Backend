const User = require('../models/User');
const Property = require('../models/Property');
const asyncHandler = require('../middleware/asyncHandler');
const generateToken = require('../utils/generateToken');
const { sendNotification } = require('../utils/notificationUtil');

// ... (toggleWishlist, getWishlist, getUsers, deleteUser, updateUserRole, getUserProfile, updateUserProfile)

// @desc    Apply for seller account
// @route   POST /api/users/apply-seller
// @access  Private
const applyForSeller = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        if (user.role === 'agent' || user.role === 'admin') {
            res.status(400);
            throw new Error('You are already an agent or admin');
        }

        user.sellerApplicationStatus = 'pending';
        // You could save extra application details here from req.body if needed

        const updatedUser = await user.save();
        const token = generateToken(res, updatedUser._id);

        // Notify Admins
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
            await sendNotification(req.io, {
                user: admin._id,
                title: 'New Seller Application',
                message: `${updatedUser.name} has applied for a seller account.`,
                type: 'info',
                link: '/admin/dashboard'
            });
        }

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            sellerApplicationStatus: updatedUser.sellerApplicationStatus,
            avatar: updatedUser.avatar,
            token
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Reject seller application
// @route   PUT /api/users/:id/reject-seller
// @access  Private/Admin
const rejectSellerApplication = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    const { reason } = req.body;

    if (user) {
        user.sellerApplicationStatus = 'rejected';
        user.rejectionReason = reason || 'No specific reason provided.';
        await user.save();

        await sendNotification(req.io, {
            user: user._id,
            title: 'Application Rejected',
            message: `Your seller application was rejected. Reason: ${user.rejectionReason}`,
            type: 'error',
            link: '/dashboard'
        });

        res.json({ message: 'Application rejected' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Toggle wishlist item
// @route   PUT /api/users/wishlist/:propertyId
// @access  Private
const toggleWishlist = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);
    const propertyId = req.params.propertyId;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
        res.status(404);
        throw new Error('Property not found');
    }

    // Check if already in wishlist
    const isInWishlist = user.wishlist.includes(propertyId);

    if (isInWishlist) {
        // Remove from wishlist
        user.wishlist = user.wishlist.filter(id => id.toString() !== propertyId);
        // Decrement wishlist count
        property.stats.wishlistCount = Math.max(0, property.stats.wishlistCount - 1);
    } else {
        // Add to wishlist
        user.wishlist.push(propertyId);
        // Increment wishlist count
        property.stats.wishlistCount += 1;
    }

    await user.save();
    await property.save();

    res.json({ wishlist: user.wishlist });
});

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('wishlist');
    // Reverse the array to show newest items first (since push adds to the end)
    res.json(user.wishlist.reverse());
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
    res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user._id.equals(req.user._id)) {
            res.status(400);
            throw new Error('You cannot delete your own admin account');
        }
        user.isDeleted = true;
        await user.save();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (req.body.role === 'agent' && user.role !== 'agent') {
            // If upgrading to agent, clear the application status
            user.sellerApplicationStatus = 'none';
        }
        user.role = req.body.role || user.role;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            sellerApplicationStatus: user.sellerApplicationStatus,
            rejectionReason: user.rejectionReason,
            receivePushNotifications: user.receivePushNotifications,
            authProviders: user.authProviders
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;

        if (req.body.password) {
            user.password = req.body.password;
        }

        if (req.body.receivePushNotifications !== undefined) {
            user.receivePushNotifications = req.body.receivePushNotifications;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            receivePushNotifications: updatedUser.receivePushNotifications,
            authProviders: updatedUser.authProviders
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});



module.exports = {
    toggleWishlist,
    getWishlist,
    getUsers,
    deleteUser,
    updateUserRole,
    getUserProfile,
    updateUserProfile,
    applyForSeller,
    rejectSellerApplication
};
