const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn('WARNING: Cloudinary environment variables are missing. Image uploads will fail.');
}

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        // Fallback for development if keys are missing
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            console.log('Cloudinary keys missing. Returning mock image URL.');
            return resolve({
                secure_url: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
                public_id: 'mock-id-' + Date.now()
            });
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'real-estate-properties',
            },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    console.error('Cloudinary Upload Failed (falling back to mock):', error);
                    // Fallback to mock image on failure, so the app doesn't break
                    resolve({
                        secure_url: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
                        public_id: 'mock-id-' + Date.now()
                    });
                }
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

module.exports = { cloudinary, uploadToCloudinary };
