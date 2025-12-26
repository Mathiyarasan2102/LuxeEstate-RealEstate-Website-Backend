const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && user.isDeleted) {
        res.status(403);
        throw new Error('Your account has been suspended or deleted. Please contact support.');
    }

    if (user && (await user.matchPassword(password))) {
        // Ensure local provider is marked active
        if (!user.authProviders.local) {
            user.authProviders.local = true;
            await user.save();
        }

        const token = generateToken(res, user._id);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            sellerApplicationStatus: user.sellerApplicationStatus,
            receivePushNotifications: user.receivePushNotifications,
            authProviders: user.authProviders,
            token
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // STRICT: Always force role to 'user' initially.
    // If they requested 'agent' (via isSeller=true), we set application status to pending.
    const requestedRole = req.body.role;
    const sellerApplicationStatus = requestedRole === 'agent' ? 'pending' : 'none';

    const user = await User.create({
        name,
        email,
        password,
        role: 'user', // Force user role
        sellerApplicationStatus,
        authProviders: {
            local: true,
            google: false
        }
    });

    if (user) {
        const token = generateToken(res, user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            sellerApplicationStatus: user.sellerApplicationStatus, // Return status
            receivePushNotifications: user.receivePushNotifications,
            authProviders: user.authProviders,
            token
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Google Login / Signup
// @route   POST /api/auth/google
// @access  Public
const googleLogin = asyncHandler(async (req, res) => {
    const { credential } = req.body;

    // 1. Verify Google Token
    let ticket;
    try {

        ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
    } catch (error) {
        console.error("Google verifyIdToken failed:", error.message);
        res.status(401);
        throw new Error('Invalid Google Token: ' + error.message);
    }

    const { email, name, picture, sub: googleId } = ticket.getPayload();

    // 2. Logic: Unified Identity
    // Step A: Check if user exists with this Email
    let user = await User.findOne({ email });

    if (user && user.isDeleted) {
        res.status(403);
        throw new Error('Your account has been suspended or deleted. Please contact support.');
    }

    if (user) {
        // User exists! Link Google Account if not linked yet
        if (!user.googleId) {
            user.googleId = googleId;
            // Always update avatar to Google's latest if signing in with Google
            // This fixes issues where a previous image might be broken
            user.avatar = picture;
            user.authProviders.google = true;
            await user.save();
        } else {
            // Even if already linked, update the avatar to keep it fresh
            // This specifically addresses the user's request to fix broken images
            // when the Google image becomes available/valid again.
            if (picture && user.avatar !== picture) {
                user.avatar = picture;
                await user.save();
            }
        }
    } else {
        // Step B: User does not exist, check by googleId (edge case if email changed?)
        // Usually, email is stable. We trust email.
        user = await User.create({
            name,
            email,
            googleId,
            avatar: picture,
            authProviders: {
                local: false,
                google: true
            }
        });
    }

    // 3. Issue Token
    if (user) {
        const token = generateToken(res, user._id);
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            sellerApplicationStatus: user.sellerApplicationStatus,
            receivePushNotifications: user.receivePushNotifications,
            authProviders: user.authProviders,
            token
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data from Google');
    }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    // Select +password to compare oldPassword
    const user = await User.findById(req.user._id).select('+password');

    if (user) {
        user.name = req.body.name || user.name;

        // Security Rule: Admin email cannot be changed
        if (user.role !== 'admin') {
            user.email = req.body.email || user.email;
        }

        if (req.body.receivePushNotifications !== undefined) {
            user.receivePushNotifications = req.body.receivePushNotifications;
        }

        if (req.body.password) {
            const { oldPassword } = req.body;
            if (!oldPassword) {
                res.status(400);
                throw new Error('Please provide your current password to set a new one.');
            }

            if (!(await user.matchPassword(oldPassword))) {
                res.status(401);
                throw new Error('Invalid current password');
            }

            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        // Remove password from response
        updatedUser.password = undefined;

        // Re-generate token (optional, but good practice if security stamp changes)
        const token = generateToken(res, updatedUser._id);

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
            role: updatedUser.role,
            receivePushNotifications: updatedUser.receivePushNotifications,
            authProviders: updatedUser.authProviders,
            token
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    loginUser,
    registerUser,
    googleLogin,
    logoutUser,
    updateUserProfile
};
