const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Property = require('./models/Property');
const Inquiry = require('./models/Inquiry');

dotenv.config();

const connectDB = async () => {
    try {
        if (process.env.MONGO_URI && process.env.MONGO_URI.includes('localhost')) {
            process.env.MONGO_URI = process.env.MONGO_URI.replace('localhost', '127.0.0.1');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Verification');
    } catch (error) {
        console.error('DB Connection Error:', error);
        process.exit(1);
    }
};

const verify = async () => {
    await connectDB();
    try {
        const mathi = await User.findOne({ email: 'mathi@gmail.com' });
        if (!mathi) {
            console.error('Error: User mathi@gmail.com NOT found');
            process.exit(1);
        }
        console.log(`User Found: ${mathi.email}`);
        console.log(`Wishlist Count: ${mathi.wishlist ? mathi.wishlist.length : 0}`);

        const mathiPropsCount = await Property.countDocuments({ agentId: mathi._id });
        console.log(`Mathi Properties Count: ${mathiPropsCount}`);

        // Get properties IDs for Mathi
        const mathiProps = await Property.find({ agentId: mathi._id }).select('_id');
        const mathiPropIds = mathiProps.map(p => p._id);

        const inquiriesReceivedCount = await Inquiry.countDocuments({ propertyId: { $in: mathiPropIds } });
        console.log(`Inquiries Received Count: ${inquiriesReceivedCount}`);

        const inquiriesSentCount = await Inquiry.countDocuments({ userId: mathi._id });
        console.log(`Inquiries Sent Count: ${inquiriesSentCount}`);

        if (mathiPropsCount === 0 || inquiriesReceivedCount === 0) {
            console.warn('WARNING: Counts are zero, seeding might have failed silently?');
        }

        process.exit(0);
    } catch (e) {
        console.error('Verification Error:', e);
        process.exit(1);
    }
};

verify();
