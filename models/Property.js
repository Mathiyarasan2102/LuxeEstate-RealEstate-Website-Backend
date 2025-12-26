const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a property title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    slug: {
        type: String,
        unique: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [5000, 'Description cannot be more than 5000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        formattedAddress: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    bedrooms: {
        type: Number,
        required: [true, 'Please add number of bedrooms']
    },
    bathrooms: {
        type: Number,
        required: [true, 'Please add number of bathrooms']
    },
    areaSqft: {
        type: Number,
        required: [true, 'Please add area in sqft']
    },
    propertyType: {
        type: String,
        required: true,
        enum: ['House', 'Apartment', 'Condo', 'Villa', 'Commercial', 'Land']
    },
    amenities: {
        type: [String]
    },
    images: {
        type: [String]
    },
    coverImage: {
        type: String,
        required: [true, 'Please add a cover image']
    },
    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    approvalStatus: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'rejected'],
        default: 'draft'
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    adminNote: {
        type: String
    },
    stats: {
        views: {
            type: Number,
            default: 0
        },
        inquiries: {
            type: Number,
            default: 0
        },
        wishlistCount: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Create slug from name
// Create slug from name
propertySchema.pre('save', async function () {
    if (this.isModified('title') || this.isNew) {
        this.slug = this.title.split(' ').join('-').toLowerCase() + '-' + Date.now();
    }
});

module.exports = mongoose.model('Property', propertySchema);
