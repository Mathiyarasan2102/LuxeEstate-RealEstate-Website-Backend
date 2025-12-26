const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: [true, 'Please add a message'],
        maxlength: [1000, 'Message cannot be more than 1000 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'responded'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Inquiry', inquirySchema);
