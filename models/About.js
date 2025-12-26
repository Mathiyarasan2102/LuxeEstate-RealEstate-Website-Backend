const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
    companyInfo: {
        name: {
            type: String,
            default: 'LuxeEstate'
        },
        tagline: {
            type: String,
            default: 'Your Gateway to Luxury Living'
        },
        description: {
            type: String,
            default: 'At LuxeEstate, we specialize in connecting discerning clients with the world\'s most exceptional properties.'
        },
        mission: {
            type: String,
            default: 'To redefine luxury real estate by providing unparalleled service and exclusive access to the finest properties worldwide.'
        },
        vision: {
            type: String,
            default: 'To be the world\'s most trusted name in luxury real estate, setting new standards of excellence in every transaction.'
        }
    },
    statistics: {
        propertiesSold: {
            type: Number,
            default: 500
        },
        happyClients: {
            type: Number,
            default: 1000
        },
        yearsExperience: {
            type: Number,
            default: 15
        },
        awards: {
            type: Number,
            default: 25
        }
    },
    teamMembers: [{
        name: String,
        role: String,
        image: String,
        bio: String,
        email: String,
        phone: String,
        order: Number
    }],
    values: [{
        title: String,
        description: String,
        icon: String,
        order: Number
    }],
    contactInfo: {
        email: {
            type: String,
            default: 'contact@luxeestate.com'
        },
        phone: {
            type: String,
            default: '+1 (555) 123-4567'
        },
        address: {
            type: String,
            default: '123 Luxury Lane, Beverly Hills, CA 90210'
        },
        officeHours: {
            weekdays: {
                type: String,
                default: '9:00 AM - 6:00 PM'
            },
            weekends: {
                type: String,
                default: '10:00 AM - 4:00 PM'
            }
        }
    },
    socialMedia: {
        facebook: String,
        twitter: String,
        instagram: String,
        linkedin: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('About', aboutSchema);
