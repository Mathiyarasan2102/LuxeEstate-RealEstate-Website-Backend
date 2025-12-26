const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
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
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    try {
        // 1. Create/Get Main User (mathi@gmail.com)
        let mainUser = await User.findOne({ email: 'mathi@gmail.com' });
        if (!mainUser) {
            console.log('Creating main user mathi@gmail.com...');
            mainUser = await User.create({
                name: 'Mathiyarasan',
                email: 'mathi@gmail.com',
                password: '123456',
                role: 'agent', // Role agent to have listings
                authProviders: { local: true }
            });
        } else {
            console.log('Main user mathi@gmail.com already exists. Updating role to agent if needed.');
            mainUser.password = '123456';
            mainUser.role = 'agent';
            await mainUser.save();
        }

        // 2. Create Dummy Users
        const dummyUsers = [
            { name: 'John Buyer', email: 'john.buyer@example.com', role: 'user' },
            { name: 'Sarah Buyer', email: 'sarah.buyer@example.com', role: 'user' },
            { name: 'Alice Agent', email: 'alice.agent@example.com', role: 'agent' }
        ];

        const createdDummyUsers = {};

        for (const u of dummyUsers) {
            let user = await User.findOne({ email: u.email });
            if (!user) {
                user = await User.create({
                    name: u.name,
                    email: u.email,
                    password: '123456',
                    role: u.role,
                    authProviders: { local: true }
                });
            }
            createdDummyUsers[u.email] = user;
        }

        const aliceAgent = createdDummyUsers['alice.agent@example.com'];
        const johnBuyer = createdDummyUsers['john.buyer@example.com'];
        const sarahBuyer = createdDummyUsers['sarah.buyer@example.com'];


        // 3. Create Properties for Mathi (Seller Listings)
        // Clear existing properties for Mathi to avoid duplicates if re-run (optional, but good for clean state)
        // Actually, let's just append but check if title exists to avoid massive dupes

        const mathiPropertiesData = [
            {
                title: 'Grand Lakefront Estate',
                description: 'Magnificent lakefront estate with private dock, panoramic views, and 5000 sq ft of luxury living space.',
                price: 2500000,
                location: {
                    formattedAddress: '101 Lakeview Dr, Austin, TX 78701',
                    city: 'Austin',
                    state: 'TX',
                    zipcode: '78701',
                    country: 'USA'
                },
                bedrooms: 5,
                bathrooms: 4,
                areaSqft: 5000,
                propertyType: 'House',
                amenities: ['Pool', 'Garden', 'Waterfront', 'Dock'],
                images: ['https://images.unsplash.com/photo-1600596542815-27bfefd0c3c6?auto=format&fit=crop&w=800&q=80'],
                coverImage: 'https://images.unsplash.com/photo-1600596542815-27bfefd0c3c6?auto=format&fit=crop&w=800&q=80',
                agentId: mainUser._id,
                approvalStatus: 'approved',
                stats: { views: 1250, inquiries: 5, wishlistCount: 12 }
            },
            {
                title: 'Downtown Modern Loft',
                description: 'Stylish loft in the heart of downtown. High ceilings, exposed brick, and walking distance to everything.',
                price: 850000,
                location: {
                    formattedAddress: '500 Main St, Austin, TX 78702',
                    city: 'Austin',
                    state: 'TX',
                    zipcode: '78702',
                    country: 'USA'
                },
                bedrooms: 2,
                bathrooms: 2,
                areaSqft: 1500,
                propertyType: 'Apartment',
                amenities: ['Gym', 'Concierge', 'Rooftop'],
                images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'],
                coverImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
                agentId: mainUser._id,
                approvalStatus: 'approved',
                stats: { views: 890, inquiries: 3, wishlistCount: 8 }
            },
            {
                title: 'Suburban Family Dream',
                description: 'Perfect family home with huge backyard, close to schools and parks.',
                price: 650000,
                location: {
                    formattedAddress: '123 Oak Ln, Round Rock, TX 78664',
                    city: 'Round Rock',
                    state: 'TX',
                    zipcode: '78664',
                    country: 'USA'
                },
                bedrooms: 4,
                bathrooms: 3,
                areaSqft: 2800,
                propertyType: 'House',
                amenities: ['Garage', 'Backyard', 'Fireplace'],
                images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'],
                coverImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
                agentId: mainUser._id,
                approvalStatus: 'approved',
                stats: { views: 450, inquiries: 2, wishlistCount: 5 }
            }
        ];

        const mathiProps = [];
        for (const p of mathiPropertiesData) {
            let prop = await Property.findOne({ title: p.title, agentId: mainUser._id });
            if (!prop) {
                prop = await Property.create(p);
                console.log(`Created property for Mathi: ${p.title}`);
            }
            mathiProps.push(prop);
        }

        // 4. Create Properties for Alice (For Wishlist/Sent Inquiries)
        const alicePropertiesData = [
            {
                title: 'Luxury Penthouse Suite',
                description: 'Top of the world views from this massive penthouse.',
                price: 3200000,
                location: {
                    formattedAddress: '999 High St, Dallas, TX 75001',
                    city: 'Dallas',
                    state: 'TX',
                    zipcode: '75001',
                    country: 'USA'
                },
                bedrooms: 3,
                bathrooms: 3.5,
                areaSqft: 3000,
                propertyType: 'Apartment',
                amenities: ['Pool', 'Spa', 'Valet'],
                images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
                coverImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
                agentId: aliceAgent._id,
                approvalStatus: 'approved',
                stats: { views: 2000, inquiries: 10, wishlistCount: 25 }
            },
            {
                title: 'Cozy Mountain Cabin',
                description: 'Get away from it all in this secluded cabin.',
                price: 450000,
                location: {
                    formattedAddress: '777 Pine Rd, Colorado Springs, CO 80903',
                    city: 'Colorado Springs',
                    state: 'CO',
                    zipcode: '80903',
                    country: 'USA'
                },
                bedrooms: 2,
                bathrooms: 1,
                areaSqft: 1200,
                propertyType: 'House',
                amenities: ['Views', 'Wood Stove', 'Hiking'],
                images: ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80'],
                coverImage: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80',
                agentId: aliceAgent._id,
                approvalStatus: 'approved'
            }
        ];

        const aliceProps = [];
        for (const p of alicePropertiesData) {
            let prop = await Property.findOne({ title: p.title, agentId: aliceAgent._id });
            if (!prop) {
                prop = await Property.create(p);
                console.log(`Created property for Alice: ${p.title}`);
            }
            aliceProps.push(prop);
        }

        // 5. Add to Mathi's Wishlist (Buyer Action)
        // Add all Alice's properties to Mathi's wishlist
        const wishlistIds = aliceProps.map(p => p._id);
        // Avoid duplicates in wishlist
        const currentWishlist = mainUser.wishlist.map(id => id.toString());
        const newWishlist = [...new Set([...currentWishlist, ...wishlistIds.map(id => id.toString())])];
        mainUser.wishlist = newWishlist;
        await mainUser.save();
        console.log(`Updated Mathi's wishlist with ${aliceProps.length} items`);


        // 6. Create Sent Inquiries (Mathi -> Alice)
        const sentInquiryData = [
            {
                propertyId: aliceProps[0]._id,
                userId: mainUser._id,
                message: 'Hi Alice, is this penthouse still available? I am very interested.',
                status: 'pending' // pending, reviewed, responded
            },
            {
                propertyId: aliceProps[1]._id,
                userId: mainUser._id,
                message: 'Can this cabin be rented out as an Airbnb?',
                status: 'responded'
            }
        ];

        for (const inq of sentInquiryData) {
            const exists = await Inquiry.findOne({ propertyId: inq.propertyId, userId: inq.userId, message: inq.message });
            if (!exists) {
                await Inquiry.create(inq);
                console.log(`Created inquiry from Mathi for ${aliceProps.find(p => p._id.equals(inq.propertyId)).title}`);
            }
        }


        // 7. Create Received Inquiries (Buyers -> Mathi)
        // Mathi has properties in 'mathiProps'
        const receivedInquiryData = [
            {
                propertyId: mathiProps[0]._id, // Lakefront
                userId: johnBuyer._id,
                message: 'What is the HOA fee for this property?',
                status: 'pending'
            },
            {
                propertyId: mathiProps[0]._id,
                userId: sarahBuyer._id,
                message: 'I love the view! When can we schedule a tour?',
                status: 'reviewed'
            },
            {
                propertyId: mathiProps[1]._id, // Loft
                userId: johnBuyer._id,
                message: 'Is parking included?',
                status: 'pending'
            },
            {
                propertyId: mathiProps[2]._id, // Suburban
                userId: sarahBuyer._id,
                message: 'Are pets allowed?',
                status: 'responded'
            }
        ];

        for (const inq of receivedInquiryData) {
            const exists = await Inquiry.findOne({ propertyId: inq.propertyId, userId: inq.userId, message: inq.message });
            if (!exists) {
                await Inquiry.create(inq);
                console.log(`Created inquiry for Mathi's property from ${inq.userId === johnBuyer._id ? 'John' : 'Sarah'}`);
            }
        }

        console.log('✅ Production data seeding completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding production data:', error);
        process.exit(1);
    }
};

seedData();
