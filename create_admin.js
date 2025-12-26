const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const createAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            console.error('Error: ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env file');
            process.exit(1);
        }

        let admin = await User.findOne({ email: adminEmail });

        if (admin) {
            console.log('Admin user already exists.');
            // Only update if environment variables have changed
            admin.role = 'admin';
            admin.password = adminPassword;
            await admin.save();
            console.log('Admin credentials updated from .env file.');
        } else {
            console.log('Creating new admin user...');
            admin = await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
                authProviders: { local: true }
            });
            console.log('Admin user created successfully.');
        }

        console.log('-----------------------------------');
        console.log(`Admin configured for: ${adminEmail}`);
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
