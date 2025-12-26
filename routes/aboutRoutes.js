const express = require('express');
const router = express.Router();
const About = require('../models/About');

// @route   GET /api/about
// @desc    Get about page data
// @access  Public
router.get('/', async (req, res) => {
    try {
        let about = await About.findOne();

        // If no about data exists, create default
        if (!about) {
            about = await About.create({
                companyInfo: {
                    name: 'LuxeEstate',
                    tagline: 'Your Gateway to Luxury Living',
                    description: 'At LuxeEstate, we specialize in connecting discerning clients with the world\'s most exceptional properties. With over 15 years of experience in luxury real estate, our team of expert agents provides unparalleled service and exclusive access to the finest homes, estates, and investment opportunities worldwide.',
                    mission: 'To redefine luxury real estate by providing unparalleled service, expert guidance, and exclusive access to the world\'s most exceptional properties.',
                    vision: 'To be the world\'s most trusted name in luxury real estate, setting new standards of excellence in every transaction and building lasting relationships with our clients.'
                },
                statistics: {
                    propertiesSold: 500,
                    happyClients: 1000,
                    yearsExperience: 15,
                    awards: 25
                },
                teamMembers: [
                    {
                        name: 'Sarah Johnson',
                        role: 'CEO & Founder',
                        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
                        bio: 'With over 20 years in luxury real estate, Sarah founded LuxeEstate to revolutionize the high-end property market.',
                        email: 'sarah@luxeestate.com',
                        phone: '+1 (555) 123-4567',
                        order: 1
                    },
                    {
                        name: 'Michael Chen',
                        role: 'Head of Sales',
                        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
                        bio: 'Michael brings 15 years of experience in luxury property sales and client relationship management.',
                        email: 'michael@luxeestate.com',
                        phone: '+1 (555) 123-4568',
                        order: 2
                    },
                    {
                        name: 'Emily Rodriguez',
                        role: 'Senior Agent',
                        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
                        bio: 'Emily specializes in waterfront properties and has closed over $200M in luxury real estate transactions.',
                        email: 'emily@luxeestate.com',
                        phone: '+1 (555) 123-4569',
                        order: 3
                    }
                ],
                values: [
                    {
                        title: 'Excellence',
                        description: 'We maintain the highest standards in every aspect of our service, from property selection to client care.',
                        icon: 'Trophy',
                        order: 1
                    },
                    {
                        title: 'Integrity',
                        description: 'Honesty and transparency guide every interaction, building trust that lasts beyond the transaction.',
                        icon: 'CheckCircle',
                        order: 2
                    },
                    {
                        title: 'Expertise',
                        description: 'Our team\'s deep market knowledge and experience ensure you make informed, confident decisions.',
                        icon: 'Users',
                        order: 3
                    },
                    {
                        title: 'Global Reach',
                        description: 'Access to exclusive properties worldwide through our extensive network of luxury real estate partners.',
                        icon: 'Globe',
                        order: 4
                    }
                ],
                contactInfo: {
                    email: 'contact@luxeestate.com',
                    phone: '+1 (555) 123-4567',
                    address: '123 Luxury Lane, Beverly Hills, CA 90210',
                    officeHours: {
                        weekdays: '9:00 AM - 6:00 PM',
                        weekends: '10:00 AM - 4:00 PM'
                    }
                },
                socialMedia: {
                    facebook: 'https://facebook.com/luxeestate',
                    twitter: 'https://twitter.com/luxeestate',
                    instagram: 'https://instagram.com/luxeestate',
                    linkedin: 'https://linkedin.com/company/luxeestate'
                }
            });
        }

        res.json(about);
    } catch (error) {
        console.error('Get about data error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/about
// @desc    Update about page data (admin only)
// @access  Private/Admin
router.put('/', async (req, res) => {
    try {
        let about = await About.findOne();

        if (!about) {
            about = await About.create(req.body);
        } else {
            about = await About.findOneAndUpdate(
                {},
                req.body,
                { new: true, runValidators: true }
            );
        }

        res.json(about);
    } catch (error) {
        console.error('Update about data error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
