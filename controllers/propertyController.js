const asyncHandler = require('../middleware/asyncHandler');
const Property = require('../models/Property');
const { uploadToCloudinary } = require('../utils/cloudinary');

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
const getProperties = asyncHandler(async (req, res) => {
    const {
        city,
        propertyType,
        type, // Alias for propertyType from frontend
        search, // General search term
        minPrice,
        maxPrice,
        bedrooms,
        bathrooms,
        page = 1,
        limit = 12
    } = req.query;

    let query = { approvalStatus: 'approved', isArchived: false };

    // Handle general search (searches title and city)
    if (search) {
        const searchRegex = new RegExp('^' + search, 'i');
        query.$or = [
            { title: searchRegex },
            { 'location.city': searchRegex },
            { 'location.state': searchRegex },
            { 'location.country': searchRegex }
        ];
    }

    // Specific city filter
    if (city) query['location.city'] = new RegExp('^' + city, 'i');

    // Property type filter (support both 'type' and 'propertyType')
    const typeFilter = type || propertyType;
    if (typeFilter) query.propertyType = typeFilter;

    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (bedrooms) query.bedrooms = { $gte: Number(bedrooms) };
    if (bathrooms) query.bathrooms = { $gte: Number(bathrooms) };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Property.countDocuments(query);

    const properties = await Property.find(query)
        .populate('agentId', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

    res.json({
        properties,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
    });
});

// @desc    Get single property by ID or Slug
// @route   GET /api/properties/:id
// @access  Public
const getProperty = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Try to find by slug first, then by ID
    let property = await Property.findOne({ slug: id }).populate('agentId', 'name email avatar');

    if (!property) {
        property = await Property.findById(id).populate('agentId', 'name email avatar');
    }

    if (!property) {
        res.status(404);
        throw new Error('Property not found');
    }

    // Increment view count
    property.stats.views += 1;
    await property.save();

    res.json(property);
});

// @desc    Get agent's properties
// @route   GET /api/properties/agent/my-listings
// @access  Private (Agent/Admin)
const getAgentProperties = asyncHandler(async (req, res) => {
    const properties = await Property.find({ agentId: req.user._id })
        .populate('agentId', 'name email avatar')
        .sort({ createdAt: -1 });

    res.json(properties);
});

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Agent/Admin)
const createProperty = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        price,
        location,
        bedrooms,
        bathrooms,
        areaSqft,
        propertyType,
        amenities,
        images,
        coverImage
    } = req.body;

    const property = await Property.create({
        title,
        description,
        price,
        location,
        bedrooms,
        bathrooms,
        areaSqft,
        propertyType,
        amenities,
        images,
        coverImage,
        agentId: req.user._id,
        approvalStatus: 'pending'
    });

    // Notify Admins
    const User = require('mongoose').model('User');
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
        await sendNotification(req.io, {
            user: admin._id,
            title: 'New Property Submission',
            message: `${req.user.name} has submitted "${property.title}" for approval.`,
            type: 'info',
            link: '/admin/dashboard?tab=listings'
        });
    }

    res.status(201).json(property);
});

const { sendNotification } = require('../utils/notificationUtil');

// ... (other controllers)

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Agent/Admin)
const updateProperty = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id);

    if (!property) {
        res.status(404);
        throw new Error('Property not found');
    }

    // Check ownership
    // Admin can update any property, Agent can only update own
    if (property.agentId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to update this property');
    }

    const previousStatus = property.approvalStatus;

    const updatedProperty = await Property.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    ).populate('agentId', 'name email avatar');

    // Notify Agent if Admin approves property
    if (req.user.role === 'admin' && previousStatus !== 'approved' && updatedProperty.approvalStatus === 'approved') {
        const agentId = updatedProperty.agentId?._id || updatedProperty.agentId;

        if (agentId) {
            console.log(`[UpdateProperty] Sending approval notification to agent: ${agentId}`);
            await sendNotification(req.io, {
                user: agentId,
                title: 'Property Approved',
                message: `Your property "${updatedProperty.title}" has been approved and is now live.`,
                type: 'success',
                link: `/properties/${updatedProperty.slug}`
            });
        }
    }

    // Notify Agent if Admin rejects property (if applicable)
    if (req.user.role === 'admin' && previousStatus !== 'rejected' && updatedProperty.approvalStatus === 'rejected') {
        const agentId = updatedProperty.agentId?._id || updatedProperty.agentId;

        if (agentId) {
            console.log(`[UpdateProperty] Sending rejection notification to agent: ${agentId}`);
            await sendNotification(req.io, {
                user: agentId,
                title: 'Property Rejected',
                message: `Your property "${updatedProperty.title}" has been rejected. Please reviews guidelines.`,
                type: 'error',
                link: `/seller/dashboard`
            });
        }
    }

    res.json(updatedProperty);
});

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Agent/Admin)
const deleteProperty = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id);

    if (!property) {
        res.status(404);
        throw new Error('Property not found');
    }

    // Check ownership
    if (property.agentId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to delete this property');
    }

    await property.deleteOne();
    res.json({ message: 'Property removed' });
});

// @desc    Publish property (submit for approval)
// @route   POST /api/properties/:id/publish
// @access  Private (Agent/Admin)
const publishProperty = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id);

    if (!property) {
        res.status(404);
        throw new Error('Property not found');
    }

    // Check ownership
    if (property.agentId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to publish this property');
    }

    property.approvalStatus = 'pending';
    await property.save();

    // Notify Admins
    // We need to find admin users
    // Note: requiring User model here creates circular dependency risk if not careful, but usually fine in node if strictly requiring model
    // Better to use mongoose.model('User') to avoid import cycle issues if User imports controller
    const User = require('mongoose').model('User');
    const admins = await User.find({ role: 'admin' });

    for (const admin of admins) {
        await sendNotification(req.io, {
            user: admin._id,
            title: 'New Property Submission',
            message: `${req.user.name} has submitted "${property.title}" for approval.`,
            type: 'info',
            link: `/admin/properties` // Assuming admin link
        });
    }

    res.json(property);
});

// @desc    Get property stats
// @route   GET /api/properties/:id/stats
// @access  Private (Agent/Admin)
const getPropertyStats = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id);

    if (!property) {
        res.status(404);
        throw new Error('Property not found');
    }

    // Check ownership
    if (property.agentId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to view stats');
    }

    res.json(property.stats);
});

// @desc    Upload property images
// @route   POST /api/properties/upload
// @access  Private (Agent/Admin)
const uploadImages = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        res.status(400);
        throw new Error('No images uploaded');
    }

    try {
        const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
        const results = await Promise.all(uploadPromises);

        const urls = results.map(result => {
            // Fallback if secure_url is missing but url exists, or just ensure it's a string
            return result.secure_url || result.url;
        });

        res.json({ urls });
    } catch (error) {
        console.error('Image Upload Error:', error);
        res.status(500);
        throw new Error('Image upload failed: ' + error.message);
    }
});


// @desc    Get all properties (Admin)
// @route   GET /api/properties/admin/all
// @access  Private (Admin)
const getAdminProperties = asyncHandler(async (req, res) => {
    const properties = await Property.find({})
        .populate('agentId', 'name email')
        .sort({ createdAt: -1 });

    res.json(properties);
});

module.exports = {
    getProperties,
    getProperty,
    getAgentProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    publishProperty,
    getPropertyStats,
    getAdminProperties,
    uploadImages
};
