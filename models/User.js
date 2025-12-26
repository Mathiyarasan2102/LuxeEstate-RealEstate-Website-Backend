const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ],
        index: true
    },
    password: {
        type: String,
        select: false,
        required: function () {
            // Password is required ONLY if local auth is enabled
            return this.authProviders.local;
        }
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true, // Allows multiple null values
        select: false
    },
    avatar: {
        type: String,
        default: 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'
    },
    role: {
        type: String,
        enum: ['user', 'agent', 'admin'],
        default: 'user'
    },
    authProviders: {
        local: {
            type: Boolean,
            default: false
        },
        google: {
            type: Boolean,
            default: false
        }
    },
    receivePushNotifications: {
        type: Boolean,
        default: true
    },
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    }],
    sellerApplicationStatus: {
        type: String,
        enum: ['none', 'pending', 'rejected'],
        default: 'none'
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    rejectionReason: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Encrypt password using bcrypt
// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
