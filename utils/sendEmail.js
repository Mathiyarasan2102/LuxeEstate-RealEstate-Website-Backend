const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // CHECK FOR PLACEHOLDER CREDENTIALS
    // If we haven't set up real email yet, just log it to the console to avoid errors
    if (process.env.SMTP_EMAIL === 'your_username' || !process.env.SMTP_EMAIL) {
        console.log('----------------------------------------------------');
        console.log('WARNING: SMTP not configured. Simulating email send.');
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log('Message:', options.message);
        console.log('----------------------------------------------------');
        return; // Return success immediately
    }

    // Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    // Define the email options
    const mailOptions = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html, // Optional: if you want to send HTML emails
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
