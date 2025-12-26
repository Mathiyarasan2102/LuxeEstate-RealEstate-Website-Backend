const Notification = require('../models/Notification');

/**
 * Create a notification and emit it via socket
 * @param {Object} io - Socket.io instance (req.io)
 * @param {Object} data - { user, title, message, type, link }
 */
const sendNotification = async (io, { user, title, message, type = 'info', link = '' }) => {
    try {
        const notification = await Notification.create({
            user,
            title,
            message,
            type,
            link
        });

        // Emit to specific user room
        if (io) {
            io.to(user.toString()).emit('receive_notification', notification);
        }

        return notification;
    } catch (error) {
        console.error('Notification Error:', error);
    }
};

module.exports = { sendNotification };
