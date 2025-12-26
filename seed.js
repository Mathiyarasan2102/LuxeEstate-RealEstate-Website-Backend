const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Property = require('./models/Property');
const User = require('./models/User');
const Inquiry = require('./models/Inquiry');
const ContactInquiry = require('./models/ContactInquiry');
const Notification = require('./models/Notification');

dotenv.config();

const seedProperties = async () => {
    try {
        await connectDB();

        // Find an agent user (or create one)
        let agent = await User.findOne({ role: 'agent' });

        if (!agent) {
            console.log('No agent found. Creating demo agent...');
            agent = await User.create({
                name: 'Demo Agent',
                email: 'agent@demo.com',
                password: 'password123',
                role: 'agent'
            });
        }

        console.log('Using agent:', agent.email);

        // Create a demo regular user for inquiries
        let user = await User.findOne({ email: 'user@demo.com' });
        if (!user) {
            console.log('Creating demo user...');
            user = await User.create({
                name: 'Demo User',
                email: 'user@demo.com',
                password: 'password123',
                role: 'user'
            });
        }

        // Clear existing data
        await Property.deleteMany({});
        await Inquiry.deleteMany({});
        await ContactInquiry.deleteMany({});
        await Notification.deleteMany({});
        console.log('Cleared existing properties, inquiries, and notifications');

        // Create sample properties
        const properties = [
            // Houses
            {
                title: 'Charming Suburban Family Home',
                description: 'Welcome to this beautifully appointed family residence nestled in one of Austin\'s most sought-after neighborhoods. This meticulously maintained 4-bedroom, 3-bathroom home offers 3,200 square feet of thoughtfully designed living space. The gourmet kitchen features granite countertops, stainless steel appliances, and a large center island perfect for family gatherings. The spacious master suite includes a spa-like bathroom and walk-in closet. Step outside to your private oasis featuring a professionally landscaped backyard with mature trees, perfect for entertaining or quiet relaxation. Located within the award-winning school district and minutes from shopping, dining, and parks. This move-in ready gem combines comfort, style, and convenience in the perfect package.',
                price: 850000,
                location: {
                    formattedAddress: '789 Maple Street, Austin, TX 78701',
                    city: 'Austin',
                    state: 'Texas',
                    zipcode: '78701',
                    country: 'USA'
                },
                bedrooms: 4,
                bathrooms: 3,
                areaSqft: 3200,
                propertyType: 'House',
                amenities: ['Garden', 'Parking', 'Air Conditioning', 'Furnished'],
                images: [
                    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80'
                ],
                coverImage: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80',
                agentId: agent._id,
                approvalStatus: 'approved'
            },
            {
                title: 'Mountain Retreat Cabin',
                description: 'Escape to your own mountain paradise in this charming 3-bedroom, 2-bathroom retreat perched in the heart of Aspen. Spanning 2,000 square feet, this cozy cabin offers breathtaking panoramic mountain views from every window. The open-concept living area features soaring vaulted ceilings, exposed wooden beams, and a magnificent stone fireplace that creates the perfect ambiance for cool mountain evenings. The expansive deck provides an ideal setting for morning coffee or evening stargazing. Floor-to-ceiling windows flood the space with natural light while showcasing the stunning alpine scenery. Complete with modern amenities while maintaining its rustic charm, this property offers the perfect blend of comfort and nature. Whether you\'re seeking a weekend retreat or year-round mountain living, this cabin delivers an unparalleled Colorado lifestyle.',
                price: 650000,
                location: {
                    formattedAddress: '555 Pine Ridge Road, Aspen, CO 81611',
                    city: 'Aspen',
                    state: 'Colorado',
                    zipcode: '81611',
                    country: 'USA'
                },
                bedrooms: 3,
                bathrooms: 2,
                areaSqft: 2000,
                propertyType: 'House',
                amenities: ['Garden', 'Parking', 'Furnished'],
                images: [
                    'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=800&q=80'
                ],
                coverImage: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=800&q=80',
                agentId: agent._id,
                approvalStatus: 'approved'
            },
            {
                title: 'Elegant Victorian Estate',
                description: 'Step back in time with this magnificent Victorian estate, a true architectural masterpiece that has been lovingly preserved and meticulously maintained. This 5-bedroom, 4-bathroom residence spans an impressive 4,200 square feet across three levels. Original hardwood floors, ornate crown molding, and period-appropriate fixtures showcase the home\'s rich heritage. The grand foyer welcomes you with a sweeping staircase and stained-glass windows. The chef\'s kitchen seamlessly blends modern functionality with vintage charm. Enjoy your morning coffee on the iconic wraparound porch overlooking mature gardens filled with perennials and century-old trees. Each bedroom offers generous proportions and abundant natural light. Located in Boston\'s prestigious Heritage Lane, this home is more than a residence—it\'s a piece of history, offering timeless elegance and modern comfort in perfect harmony.',
                price: 1450000,
                location: {
                    formattedAddress: '234 Heritage Lane, Boston, MA 02108',
                    city: 'Boston',
                    state: 'Massachusetts',
                    zipcode: '02108',
                    country: 'USA'
                },
                bedrooms: 5,
                bathrooms: 4,
                areaSqft: 4200,
                propertyType: 'House',
                amenities: ['Garden', 'Parking', 'Balcony', 'Furnished'],
                images: [
                    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80'
                ],
                coverImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
                agentId: agent._id,
                approvalStatus: 'approved'
            },
            // Apartments
            {
                title: 'Modern Downtown Penthouse',
                description: 'Experience the pinnacle of Manhattan luxury living in this extraordinary 3-bedroom, 3-bathroom penthouse residence. Occupying 2,500 square feet of prime Park Avenue real estate, this sophisticated home features floor-to-ceiling windows offering breathtaking 360-degree views of the iconic New York City skyline. The open-concept layout showcases a gourmet kitchen equipped with top-of-the-line Miele and Sub-Zero appliances, custom Italian cabinetry, and Calacatta marble countertops. The expansive master suite serves as a private sanctuary with a spa-inspired bathroom featuring a soaking tub and rain shower. Your private rooftop terrace provides an exclusive outdoor oasis high above the city bustle—perfect for entertaining or unwinding while watching the sunset over Central Park. Smart home technology, custom lighting, and premium finishes throughout complete this urban masterpiece. Building amenities include 24-hour concierge, fitness center, and valet parking.',
                price: 2800000,
                location: {
                    formattedAddress: '456 Park Avenue, New York, NY 10022',
                    city: 'New York',
                    state: 'New York',
                    zipcode: '10022',
                    country: 'USA'
                },
                bedrooms: 3,
                bathrooms: 3,
                areaSqft: 2500,
                propertyType: 'Apartment',
                amenities: ['Gym', 'Security', 'Elevator', 'Air Conditioning', 'Smart Home'],
                images: [
                    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=800&q=80'
                ],
                coverImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
                agentId: agent._id,
                approvalStatus: 'approved'
            },
            {
                title: 'Luxury High-Rise Apartment',
                description: 'Discover sophisticated urban living in this stunning 2-bedroom, 2-bathroom high-rise residence offering 1,800 square feet of meticulously designed space. Perched high above Michigan Avenue, this home delivers unobstructed panoramic views of Lake Michigan and Chicago\'s magnificent skyline. The contemporary interior features wide-plank hardwood floors, designer lighting fixtures, and a neutral palette that creates an atmosphere of refined elegance. The gourmet kitchen boasts quartz waterfall countertops, custom cabinetry, and premium stainless steel appliances. Floor-to-ceiling windows bathe every room in natural light while showcasing the spectacular city views. The master suite includes a luxurious en-suite bathroom with dual vanities and a frameless glass shower. Residents enjoy resort-style amenities including a rooftop infinity pool, state-of-the-art fitness center, private theater, and 24-hour concierge service. This is more than an apartment—it\'s a lifestyle.',
                price: 1950000,
                location: {
                    formattedAddress: '888 Michigan Avenue, Chicago, IL 60611',
                    city: 'Chicago',
                    state: 'Illinois',
                    zipcode: '60611',
                    country: 'USA'
                },
                bedrooms: 2,
                bathrooms: 2,
                areaSqft: 1800,
                propertyType: 'Apartment',
                amenities: ['Pool', 'Gym', 'Security', 'Elevator', 'Air Conditioning'],
                images: [
                    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1560448204-444092e1a0cc?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=800&q=80'
                ],
                coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
                agentId: agent._id,
                approvalStatus: 'approved'
            },
            // Condos
            {
                title: 'Contemporary Urban Loft',
                description: 'Embrace the ultimate urban lifestyle in this spectacular 2-bedroom, 2-bathroom contemporary loft spanning 1,800 square feet in San Francisco\'s vibrant arts district. This architecturally stunning space celebrates industrial design with exposed brick walls, polished concrete floors, and soaring 14-foot ceilings with original steel beams. Oversized factory windows flood the open-concept living area with abundant natural light. The modern kitchen features sleek European cabinetry, quartz countertops, and high-end stainless steel appliances. The master suite offers a private retreat with custom built-ins and a spa-like bathroom. Original architectural details blend seamlessly with contemporary updates, creating a unique living space that\'s both stylish and functional. Located steps from acclaimed galleries, artisan coffee shops, and farm-to-table restaurants, this loft puts you at the heart of the city\'s creative energy. One parking space included.',
                price: 1200000,
                location: {
                    formattedAddress: '321 Industrial Way, San Francisco, CA 94102',
                    city: 'San Francisco',
                    state: 'California',
                    zipcode: '94102',
                    country: 'USA'
                },
                bedrooms: 2,
                bathrooms: 2,
                areaSqft: 1800,
                propertyType: 'Condo',
                amenities: ['Parking', 'Elevator', 'Air Conditioning'],
                images: [
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=80'
                ],
                coverImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
                agentId: agent._id,
                approvalStatus: 'approved'
            },
            {
                title: 'Waterfront Condo with Marina Views',
                description: 'Wake up to stunning marina views in this bright and beautifully appointed 2-bedroom, 2-bathroom waterfront condo offering 1,500 square feet of coastal living at its finest. Floor-to-ceiling windows frame breathtaking views of sailboats gliding across the water and the Olympic Mountains beyond. The open floor plan seamlessly connects the living, dining, and kitchen areas, perfect for entertaining. The chef\'s kitchen features quartz countertops, soft-close cabinetry, and premium stainless steel appliances. Step onto your private balcony to enjoy morning coffee while watching the sunrise over the marina. The spacious master bedroom includes an en-suite bathroom with dual vanities and a walk-in shower. Modern finishes throughout include hardwood floors, designer lighting, and custom window treatments. Building amenities include a fitness center, secure parking, and storage. Located in Seattle\'s coveted Harbor Drive, you\'re steps from waterfront dining, boutique shopping, and the ferry terminal.',
                price: 975000,
                location: {
                    formattedAddress: '567 Harbor Drive, Seattle, WA 98101',
                    city: 'Seattle',
                    state: 'Washington',
                    zipcode: '98101',
                    country: 'USA'
                },
                bedrooms: 2,
                bathrooms: 2,
                areaSqft: 1500,
                propertyType: 'Condo',
                amenities: ['Balcony', 'Parking', 'Security', 'Gym'],
                images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
                coverImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
                agentId: agent._id,
                approvalStatus: 'approved'
            },
            // Villas
            {
                title: 'Luxury Beachfront Villa',
                description: 'Indulge in the ultimate Malibu lifestyle with this extraordinary 5-bedroom, 4-bathroom oceanfront villa spanning 4,500 square feet of pure luxury. This architectural masterpiece sits on a prime beachfront lot offering unobstructed 180-degree views of the Pacific Ocean. The seamless indoor-outdoor design features walls of glass that disappear to reveal expansive terraces and a stunning infinity-edge pool that appears to merge with the ocean horizon. The gourmet kitchen is a chef\'s dream with top-of-the-line Wolf and Sub-Zero appliances, custom cabinetry, and a large center island. The master suite occupies the entire upper level, featuring a private terrace, fireplace, spa-like bathroom with ocean-view soaking tub, and an expansive walk-in closet. Additional highlights include a media room, wine cellar, home gym, and direct private beach access via a gated path. Smart home technology controls lighting, climate, security, and entertainment throughout. This is coastal living at its absolute finest.',
                price: 4500000,
                location: {
                    formattedAddress: '123 Ocean Drive, Malibu, CA 90265',
                    city: 'Malibu',
                    state: 'California',
                    zipcode: '90265',
                    country: 'USA'
                },
                bedrooms: 5,
                bathrooms: 4,
                areaSqft: 4500,
                propertyType: 'Villa',
                amenities: ['Pool', 'Sea View', 'Garden', 'Parking', 'Security'],
                images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80'],
                coverImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
                agentId: agent._id,
                approvalStatus: 'approved'
            },
            {
                title: 'Mediterranean Paradise Villa',
                description: 'Transport yourself to the Mediterranean with this exquisite 4-bedroom, 4-bathroom villa nestled in the heart of Napa Valley wine country. This 4,000-square-foot estate exemplifies Old World charm with modern luxury amenities. Enter through custom wrought-iron gates into a private courtyard featuring a hand-carved stone fountain surrounded by fragrant lavender and olive trees. The home showcases authentic Spanish tile, arched doorways, exposed beam ceilings, and terracotta floors throughout. The chef\'s kitchen is a culinary masterpiece with professional-grade Viking appliances, a La Cornue range, marble countertops, and a butler\'s pantry. The temperature-controlled wine cellar accommodates 1,000+ bottles—perfect for the wine enthusiast. The master suite offers a private sanctuary with a fireplace, sitting area, and French doors opening to the pool terrace. Outside, enjoy al fresco dining under the covered loggia, take a dip in the resort-style pool, or stroll through the manicured gardens. This villa offers a rare opportunity to own a piece of Tuscan-inspired paradise in America\'s premier wine region.',
                price: 3750000,
                location: {
                    formattedAddress: '999 Vineyard Road, Napa, CA 94558',
                    city: 'Napa',
                    state: 'California',
                    zipcode: '94558',
                    country: 'USA'
                },
                bedrooms: 4,
                bathrooms: 4,
                areaSqft: 4000,
                propertyType: 'Villa',
                amenities: ['Pool', 'Garden', 'Parking', 'Air Conditioning', 'Furnished'],
                images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'],
                coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
                agentId: agent._id,
                approvalStatus: 'approved'
            },
            {
                title: 'Tropical Island Villa',
                description: 'Own your own private paradise with this ultra-luxurious 6-bedroom, 6-bathroom island villa spanning 6,500 square feet of unparalleled opulence. This exclusive estate occupies an entire private island in the Florida Keys, accessible only by boat or helicopter (helipad included). The contemporary tropical architecture features floor-to-ceiling glass walls, soaring ceilings, and seamless indoor-outdoor living spaces. Every room offers breathtaking ocean views and direct access to pristine white sand beaches and crystal-clear turquoise waters. The gourmet kitchen features top-of-the-line appliances, a wine room, and opens to an outdoor summer kitchen perfect for beachside entertaining. The master suite is a private sanctuary with a spa bathroom, private terrace, and infinity-edge plunge pool. Additional amenities include a home theater, fitness center, infinity pool, hot tub, private dock for yachts up to 100 feet, and full smart home automation. Staff quarters and a separate guest house ensure privacy for all. This is more than a home—it\'s an exclusive tropical resort offering the ultimate in privacy, luxury, and natural beauty.',
                price: 8900000,
                location: {
                    formattedAddress: '1 Paradise Island, Key West, FL 33040',
                    city: 'Key West',
                    state: 'Florida',
                    zipcode: '33040',
                    country: 'USA'
                },
                bedrooms: 6,
                bathrooms: 6,
                areaSqft: 6500,
                propertyType: 'Villa',
                amenities: ['Pool', 'Sea View', 'Garden', 'Security', 'Smart Home'],
                images: ['https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?auto=format&fit=crop&w=800&q=80'],
                coverImage: 'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?auto=format&fit=crop&w=800&q=80',
                agentId: agent._id,
                approvalStatus: 'approved'
            },
            // Commercial
            {
                title: 'Prime Downtown Office Building',
                description: 'Seize this exceptional investment opportunity with this Class A office building strategically located in Dallas\' prestigious central business district. This 25,000-square-foot commercial property has undergone a comprehensive $2M renovation, featuring a stunning modern lobby with marble floors, updated elevator systems, and state-of-the-art HVAC throughout. The building offers flexible floor plates ideal for corporate headquarters or multi-tenant configuration, with each floor providing approximately 5,000 square feet of premium office space. Recent upgrades include energy-efficient LED lighting, high-speed fiber optic infrastructure, and advanced security systems with keycard access. The attached parking garage provides 50 covered spaces—a rare commodity in the downtown core. Current occupancy rate of 85% with established tenants on long-term leases ensures stable cash flow. The prime location offers unparalleled access to major highways, public transportation, upscale dining, and hotels. Building amenities include a modern conference center, fitness facility, and on-site property management. This turnkey investment combines strong fundamentals with significant upside potential in one of Texas\' fastest-growing markets.',
                price: 12500000,
                location: {
                    formattedAddress: '777 Business Plaza, Dallas, TX 75201',
                    city: 'Dallas',
                    state: 'Texas',
                    zipcode: '75201',
                    country: 'USA'
                },
                bedrooms: 0,
                bathrooms: 10,
                areaSqft: 25000,
                propertyType: 'Commercial',
                amenities: ['Parking', 'Security', 'Elevator', 'Air Conditioning'],
                images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'],
                coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
                agentId: agent._id,
                approvalStatus: 'approved'
            },
            {
                title: 'Retail Shopping Center',
                description: 'Capitalize on this premier retail investment opportunity featuring a well-established 35,000-square-foot shopping center in Phoenix\'s high-growth corridor. This strategically positioned property boasts excellent visibility from Commerce Street with daily traffic counts exceeding 45,000 vehicles. The center features a strong tenant mix including two anchor tenants (national grocery chain and fitness center) on long-term leases, plus eight additional retail spaces currently 92% occupied. Recent capital improvements include a complete facade renovation, new LED parking lot lighting, upgraded landscaping, and resurfaced parking accommodating 150 vehicles. The property benefits from a dense surrounding population with above-average household incomes and strong demographics. Triple-net lease structure ensures minimal landlord responsibilities while providing stable, predictable cash flow. Additional revenue opportunities exist through monument signage and rooftop cellular leases. Located near major residential developments and with excellent freeway access, this shopping center has demonstrated consistent performance with year-over-year NOI growth. Detailed financial statements and rent rolls available to qualified buyers. This is a rare opportunity to acquire a stabilized, income-producing asset in one of the nation\'s fastest-growing metropolitan areas.',
                price: 8750000,
                location: {
                    formattedAddress: '456 Commerce Street, Phoenix, AZ 85001',
                    city: 'Phoenix',
                    state: 'Arizona',
                    zipcode: '85001',
                    country: 'USA'
                },
                bedrooms: 0,
                bathrooms: 8,
                areaSqft: 35000,
                propertyType: 'Commercial',
                amenities: ['Parking', 'Security'],
                images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80'],
                coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
                agentId: agent._id,
                approvalStatus: 'approved'
            },
            // Land
            {
                title: 'Scenic Mountain Land - 50 Acres',
                description: 'Discover this extraordinary 50-acre mountain paradise offering endless possibilities in the exclusive Jackson Hole area. This pristine parcel features dramatic elevation changes, providing breathtaking panoramic views of the Teton Mountain Range and valley below. A year-round creek meanders through the property, creating natural water features and supporting abundant wildlife including elk, deer, and moose. Mature stands of aspen and pine trees provide both privacy and natural beauty. The property offers multiple ideal building sites for a custom luxury estate, each with spectacular views and southern exposure. Utilities are available at the property line, and the land is zoned for residential development with the potential for subdivision (buyer to verify). Located just 15 minutes from world-class skiing, fine dining, and cultural amenities, yet offering complete privacy and seclusion. The property includes deeded access via a maintained private road and borders national forest land, ensuring your views and privacy will never be compromised. Whether you envision a family compound, exclusive resort, or legacy ranch, this remarkable property offers a once-in-a-lifetime opportunity to own a piece of Wyoming\'s most coveted landscape.',
                price: 1250000,
                location: {
                    formattedAddress: 'Mountain View Road, Jackson Hole, WY 83001',
                    city: 'Jackson Hole',
                    state: 'Wyoming',
                    zipcode: '83001',
                    country: 'USA'
                },
                bedrooms: 0,
                bathrooms: 0,
                areaSqft: 2178000, // 50 acres
                propertyType: 'Land',
                amenities: [],
                images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'],
                coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
                agentId: agent._id,
                approvalStatus: 'approved'
            },
            {
                title: 'Beachfront Development Land',
                description: 'Seize this once-in-a-generation opportunity to develop 10 acres of pristine California coastline with approved plans for a luxury boutique resort. This extraordinary beachfront parcel offers 500+ feet of direct ocean frontage with unobstructed views stretching from Point Conception to the Channel Islands. The property comes with fully approved entitlements for a 50-room luxury resort including spa, restaurant, infinity pool, and private beach club. Environmental studies, geological reports, and architectural plans by renowned coastal architects are complete and transferable. The gently sloping topography provides ideal development conditions while maximizing ocean views from every planned structure. Located along Santa Barbara\'s exclusive Coastal Highway, the property benefits from proximity to world-class wineries, polo clubs, and upscale shopping while maintaining a secluded, private atmosphere. Current zoning allows for luxury residential development as an alternative to the resort concept. Utilities including water, sewer, and electricity are available at the property line. With California\'s increasingly restrictive coastal development regulations, opportunities like this are virtually extinct. This is a rare chance to create a legacy property in one of the world\'s most desirable coastal locations.',
                price: 15000000,
                location: {
                    formattedAddress: 'Coastal Highway, Santa Barbara, CA 93101',
                    city: 'Santa Barbara',
                    state: 'California',
                    zipcode: '93101',
                    country: 'USA'
                },
                bedrooms: 0,
                bathrooms: 0,
                areaSqft: 435600, // 10 acres
                propertyType: 'Land',
                amenities: ['Sea View'],
                images: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=800&q=80'],
                coverImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=800&q=80',
                agentId: agent._id,
                approvalStatus: 'approved'
            },
            {
                title: 'Agricultural Farmland - 200 Acres',
                description: 'Invest in this exceptional 200-acre agricultural property representing one of Iowa\'s premier farming operations. This highly productive farmland features Class A soil rated among the state\'s best, with a proven track record of superior crop yields. The property includes a comprehensive center-pivot irrigation system covering 160 acres, ensuring consistent production regardless of weather conditions. Established water rights and three irrigation wells provide reliable water access. Infrastructure includes a 10,000-square-foot modern barn with concrete floors and electricity, a 5,000-square-foot equipment storage building, and grain storage facilities with 50,000-bushel capacity. The land has been professionally tiled for optimal drainage and has been in continuous agricultural production for over 50 years. Recent soil tests and yield data available to qualified buyers. The property is currently leased to an established farmer on a crop-share basis, providing immediate income while allowing for owner operation in the future. Located just 20 minutes from Des Moines with excellent highway access for equipment and grain transport. Whether you\'re an experienced farmer, investor, or looking to diversify your portfolio with agricultural real estate, this turnkey operation offers strong fundamentals and excellent long-term appreciation potential.',
                price: 3200000,
                location: {
                    formattedAddress: 'Rural Route 5, Des Moines, IA 50309',
                    city: 'Des Moines',
                    state: 'Iowa',
                    zipcode: '50309',
                    country: 'USA'
                },
                bedrooms: 0,
                bathrooms: 0,
                areaSqft: 8712000, // 200 acres
                propertyType: 'Land',
                amenities: [],
                images: ['https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80'],
                coverImage: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
                agentId: agent._id,
                approvalStatus: 'approved'
            }
        ];

        // Create properties one by one to trigger pre-save hooks
        let count = 0;
        const createdProperties = [];
        for (const propertyData of properties) {
            const prop = await Property.create(propertyData);
            createdProperties.push(prop);
            count++;
        }

        console.log(`✅ Created ${count} properties with slugs`);

        // Seed Inquiries
        if (createdProperties.length > 0) {
            const inquiries = [
                {
                    propertyId: createdProperties[0]._id,
                    userId: user._id,
                    message: 'I am interested in this property. When can I visit?',
                    status: 'pending'
                },
                {
                    propertyId: createdProperties[1]._id,
                    userId: user._id,
                    message: 'Is the price negotiable?',
                    status: 'reviewed'
                },
                {
                    propertyId: createdProperties[0]._id,
                    userId: user._id,
                    message: 'Does this come with the furniture?',
                    status: 'responded'
                }
            ];
            await Inquiry.insertMany(inquiries);
            console.log('✅ Seeded sample inquiries');
        }

        // Seed Contact Inquiries
        const contactInquiries = [
            {
                name: 'Sarah Smith',
                email: 'sarah@test.com',
                subject: 'Partnership Opportunity',
                message: 'Hello, I am a local interior designer looking to partner with agents.',
                status: 'new'
            },
            {
                name: 'Mike Johnson',
                email: 'mike@test.com',
                subject: 'Website Issue',
                message: 'I found a bug on the search page.',
                status: 'read'
            }
        ];
        await ContactInquiry.insertMany(contactInquiries);
        console.log('✅ Seeded contact inquiries');

        // Seed Notifications
        const notifications = [
            {
                user: agent._id,
                message: 'You have a new inquiry for "Charming Suburban Family Home"',
                type: 'info',
                isRead: false
            },
            {
                user: agent._id,
                message: 'Your property "Mountain Retreat Cabin" has been approved',
                type: 'success',
                isRead: true
            }
        ];
        await Notification.insertMany(notifications);
        console.log('✅ Seeded notifications');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedProperties();
