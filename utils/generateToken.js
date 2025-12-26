const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
    // 1. Create Access Token (Short-lived)
    const token = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: '7d'
    });

    // 2. Create Refresh Token (Long-lived)
    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d'
    });

    // 3. Set Refresh Token as HTTP-Only Cookie
    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
        sameSite: 'strict', // Prevent CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return token;
};

module.exports = generateToken;
