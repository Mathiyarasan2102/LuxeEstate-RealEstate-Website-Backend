const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const frontendClientId = '475201501554-vadiv9baa2ftiegfnkminuv9gjrojvvk.apps.googleusercontent.com';

try {
    let content = "";
    if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, 'utf8');
    } else {
        console.log(".env file not found, creating new one.");
        // Basic defaults if missing
        content = `PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/real_estate_db
JWT_ACCESS_SECRET=access_secret_123
JWT_REFRESH_SECRET=refresh_secret_123
CLIENT_URL=http://localhost:5173
`;
    }

    // Helper to update or append
    const updateOrAppend = (key, value) => {
        const regex = new RegExp(`^${key}=.*`, 'm');
        if (regex.test(content)) {
            content = content.replace(regex, `${key}=${value}`);
        } else {
            content += `\n${key}=${value}`;
        }
    };

    updateOrAppend('GOOGLE_CLIENT_ID', frontendClientId);
    // Ensure Client URL is clean
    updateOrAppend('CLIENT_URL', 'http://localhost:5173');

    fs.writeFileSync(envPath, content.trim() + '\n');
    console.log("Successfully updated backend/.env with matching GOOGLE_CLIENT_ID.");
} catch (err) {
    console.error("Error checking/updating .env:", err);
}
