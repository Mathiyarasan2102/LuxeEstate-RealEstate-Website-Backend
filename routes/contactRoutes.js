const express = require('express');
const router = express.Router();
const ContactInquiry = require('../models/ContactInquiry');
const sendEmail = require('../utils/sendEmail');

// @route   POST /api/contact/submit
// @desc    Submit contact form
// @access  Public
router.post('/submit', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create contact inquiry
        const inquiry = await ContactInquiry.create({
            name,
            email,
            subject,
            message
        });

        // Send notification email to Admin
        try {
            await sendEmail({
                email: process.env.SMTP_EMAIL || process.env.FROM_EMAIL, // Send to the configured admin/support email
                subject: `New Contact Inquiry: ${subject}`,
                message: `
New message from ${name} (${email})

Subject: ${subject}
Message:
${message}
                `,
                html: `
                    <h3>New Contact Inquiry</h3>
                    <p><strong>From:</strong> ${name} (<a href="mailto:${email}">${email}</a>)</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 10px 0;">
                        <p>${message.replace(/\n/g, '<br>')}</p>
                    </div>
                `
            });
        } catch (emailError) {
            console.error('Failed to send admin notification email:', emailError);
            // innovative: don't fail the request if email fails, just log it
        }

        res.status(201).json({
            message: 'Thank you for your message. We will get back to you shortly.',
            inquiry: {
                id: inquiry._id,
                name: inquiry.name,
                email: inquiry.email,
                subject: inquiry.subject,
                createdAt: inquiry.createdAt
            }
        });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// @route   GET /api/contact/inquiries
// @desc    Get all contact inquiries (admin only)
// @access  Private/Admin
router.get('/inquiries', async (req, res) => {
    try {
        const inquiries = await ContactInquiry.find()
            .sort({ createdAt: -1 })
            .select('-__v');

        res.json(inquiries);
    } catch (error) {
        console.error('Get inquiries error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/contact/inquiries/:id/status
// @desc    Update inquiry status
// @access  Private/Admin
router.put('/inquiries/:id/status', async (req, res) => {
    try {
        const { status, response } = req.body;

        const inquiry = await ContactInquiry.findByIdAndUpdate(
            req.params.id,
            { status, response },
            { new: true, runValidators: true }
        );

        if (!inquiry) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }

        res.json(inquiry);
    } catch (error) {
        console.error('Update inquiry error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
