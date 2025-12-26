const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (process.env.MONGO_URI && process.env.MONGO_URI.includes('localhost')) {
            process.env.MONGO_URI = process.env.MONGO_URI.replace('localhost', '127.0.0.1');
        }
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
