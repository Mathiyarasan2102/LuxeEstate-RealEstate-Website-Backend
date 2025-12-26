const express = require('express');
const router = express.Router();
const {
    loginUser,
    registerUser,
    logoutUser,
    googleLogin,
    updateUserProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/logout', logoutUser);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
