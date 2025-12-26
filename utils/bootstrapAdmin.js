const User = require('../models/User');

const bootstrapAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: 'admin' });

        if (adminExists) {
            return;
        }

        const initialEmail = process.env.INITIAL_ADMIN_EMAIL;
        const initialPassword = process.env.INITIAL_ADMIN_PASSWORD;

        if (!initialEmail || !initialPassword) {
            console.log('Skipping Admin Bootstrap: INITIAL_ADMIN_EMAIL or INITIAL_ADMIN_PASSWORD not set.');
            return;
        }

        const admin = await User.create({
            name: 'Admin',
            email: initialEmail,
            password: initialPassword,
            role: 'admin',
            authProviders: {
                local: true
            }
        });

        console.log(`\n✅ Admin Bootstrap: Created initial admin (${admin.email})`);
    } catch (error) {
        console.error('❌ Admin Bootstrap Error:', error.message);
    }
};

module.exports = bootstrapAdmin;
