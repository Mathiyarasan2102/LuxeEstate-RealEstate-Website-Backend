const asyncHandler = require('../middleware/asyncHandler');
const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');
const { sendNotification } = require('../utils/notificationUtil');

// @desc    Create new inquiry
// @route   POST /api/inquiries
// @access  Private
const createInquiry = asyncHandler(async (req, res) => {
    const { propertyId, message } = req.body;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
        res.status(404);
        throw new Error('Property not found');
    }

    const inquiry = await Inquiry.create({
        propertyId,
        userId: req.user._id,
        message
    });

    // Increment inquiry count on property
    property.stats.inquiries += 1;
    await property.save();

    // Notify Agent/Owner
    await sendNotification(req.io, {
        user: property.agentId,
        title: 'New Property Inquiry',
        message: `New inquiry for "${property.title}": ${message.substring(0, 50)}...`,
        type: 'info',
        link: '/seller/dashboard?tab=inquiries'
    });

    const populatedInquiry = await Inquiry.findById(inquiry._id)
        .populate('userId', 'name email')
        .populate('propertyId', 'title');

    res.status(201).json(populatedInquiry);
});

// @desc    Get agent's inquiries
// @route   GET /api/inquiries/agent
// @access  Private (Agent/Admin)
const getAgentInquiries = asyncHandler(async (req, res) => {
    // Find all properties owned by the agent
    const properties = await Property.find({ agentId: req.user._id }).select('_id');
    const propertyIds = properties.map(p => p._id);

    // Find all inquiries for those properties
    const inquiries = await Inquiry.find({ propertyId: { $in: propertyIds } })
        .populate('userId', 'name email')
        .populate('propertyId', 'title')
        .sort({ createdAt: -1 });

    res.json(inquiries);
});

// @desc    Get user's inquiries
// @route   GET /api/inquiries/my
// @access  Private
const getUserInquiries = asyncHandler(async (req, res) => {
    const inquiries = await Inquiry.find({ userId: req.user._id })
        .populate('propertyId', 'title coverImage')
        .sort({ createdAt: -1 });

    res.json(inquiries);
});

// @desc    Update inquiry status
// @route   PUT /api/inquiries/:id
// @access  Private (Agent/Admin)
const updateInquiryStatus = asyncHandler(async (req, res) => {
    const inquiry = await Inquiry.findById(req.params.id).populate('propertyId');

    if (!inquiry) {
        res.status(404);
        throw new Error('Inquiry not found');
    }

    // Check if user owns the property
    if (inquiry.propertyId.agentId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to update this inquiry');
    }

    inquiry.status = req.body.status || inquiry.status;
    await inquiry.save();

    // Notify User
    if (req.body.status && inquiry.userId) {
        await sendNotification(req.io, {
            user: inquiry.userId,
            title: 'Inquiry Update',
            message: `Your inquiry for ${inquiry.propertyId.title} has been updated to ${inquiry.status}.`,
            type: 'info',
            link: '/dashboard?tab=inquiries'
        });
    }

    const updatedInquiry = await Inquiry.findById(inquiry._id)
        .populate('userId', 'name email')
        .populate('propertyId', 'title');

    res.json(updatedInquiry);
});

const sendEmail = require('../utils/sendEmail');

// @desc    Reply to an inquiry via email
// @route   POST /api/inquiries/:id/reply
// @access  Private (Agent/Admin)
const replyToInquiry = asyncHandler(async (req, res) => {
    const { subject, message } = req.body;
    const inquiry = await Inquiry.findById(req.params.id)
        .populate('userId', 'email name')
        .populate('propertyId', 'title agentId');

    if (!inquiry) {
        res.status(404);
        throw new Error('Inquiry not found');
    }

    // Check if user owns the property
    if (inquiry.propertyId.agentId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to reply to this inquiry');
    }

    if (!inquiry.userId || !inquiry.userId.email) {
        res.status(400);
        throw new Error('Inquirer email not found');
    }

    try {
        await sendEmail({
            email: inquiry.userId.email,
            subject: subject || `Re: Inquiry for ${inquiry.propertyId.title}`,
            message: `
Hello ${inquiry.userId.name},

You have received a reply regarding your inquiry for property: ${inquiry.propertyId.title}.

Message from Agent:
----------------------------------------
${message}
----------------------------------------

Best regards,
LuxeEstate Team
            `,
            html: `
                <h3>Hello ${inquiry.userId.name},</h3>
                <p>You have received a reply regarding your inquiry for property: <strong>${inquiry.propertyId.title}</strong>.</p>
                <p><strong>Message from Agent:</strong></p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    ${message.replace(/\n/g, '<br>')}
                </div>
                <p>Best regards,<br>LuxeEstate Team</p>
            `
        });

        // Update status to reviewed if it was pending
        if (inquiry.status === 'pending') {
            inquiry.status = 'reviewed';
            await inquiry.save();
        }

        // Notify User of Reply
        await sendNotification(req.io, {
            user: inquiry.userId._id,
            title: 'New Reply Received',
            message: `New reply received for your inquiry on ${inquiry.propertyId.title}`,
            type: 'success',
            link: '/dashboard?tab=inquiries'
        });

        res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {

        console.error(error);
        res.status(500);
        throw new Error('Email could not be sent');
    }
});

module.exports = {
    createInquiry,
    getAgentInquiries,
    getUserInquiries,
    updateInquiryStatus,
    replyToInquiry
};
