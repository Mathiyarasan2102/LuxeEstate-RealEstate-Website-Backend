const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const connectDB = async () => {
    try {
        if (process.env.MONGO_URI && process.env.MONGO_URI.includes('localhost')) {
            process.env.MONGO_URI = process.env.MONGO_URI.replace('localhost', '127.0.0.1');
        }
        await mongoose.connect(process.env.MONGO_URI);
    } catch (error) {
        process.exit(1);
    }
};

const check = async () => {
    await connectDB();
    try {
        const user = await User.findOne({ email: 'mathi@gmail.com' }).select('+password');
        if (!user) {
            console.log('User not found');
            return;
        }
        const isMatch = await user.matchPassword('123456');
        console.log(`Password match for '123456': ${isMatch}`);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

check();
