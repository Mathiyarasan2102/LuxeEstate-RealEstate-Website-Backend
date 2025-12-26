const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const connectDB = require('./config/db');
const bootstrapAdmin = require('./utils/bootstrapAdmin');

// Load env vars
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'MONGO_URI'
];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error('❌ ERROR: Missing required environment variables:');
    missingEnvVars.forEach(varName => {
        console.error(`   - ${varName}`);
    });
    console.error('\n📝 Please add these to your backend/.env file');
    process.exit(1);
}

// Connect to database
connectDB().then(() => {
    bootstrapAdmin();
});

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            const allowedOrigins = [
                process.env.CLIENT_URL,
                'http://localhost:5173',
                'https://luxe-estate-real-estate-website-fro.vercel.app'
            ];
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

// Socket.io Middleware to make io accessible in routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Socket Connection Handler
io.on('connection', (socket) => {
    console.log('Socket Connected:', socket.id);

    // Join user-specific room
    socket.on('join_room', (userId) => {
        if (userId) {
            socket.join(userId);
            console.log(`User ${userId} joined room ${userId}`);
        }
    });

    // Join role-specific room (e.g., 'admin', 'agent')
    socket.on('join_role', (role) => {
        if (role) {
            socket.join(role);
            console.log(`Socket ${socket.id} joined role room: ${role}`);
        }
    });

    socket.on('disconnect', () => {
        console.log('Socket Disconnected:', socket.id);
    });
});

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "no-referrer-when-downgrade" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "blob:", "https:", "*"],
            connectSrc: ["'self'", "https:", "*"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
        },
    },
}));
app.use(morgan('dev', {
    skip: function (req, res) {
        if (req.method !== 'GET') return false;
        if (res.statusCode >= 400) return false;

        const url = req.originalUrl || req.url;
        const pollingRoutes = [
            '/api/notifications',
            '/api/contact/inquiries',
            '/api/users',
            '/api/properties',
            '/api/users/profile'
        ];
        return pollingRoutes.some(route => url.includes(route));
    }
}));
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Routes (to be added)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/inquiries', require('./routes/inquiryRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/about', require('./routes/aboutRoutes'));

// Error Handler Middleware
app.use((err, req, res, next) => {
    console.error('=== ERROR HANDLER ===');
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            message: 'File too large. Maximum size is 50MB.',
            stack: process.env.NODE_ENV === 'production' ? null : err.stack,
        });
    }

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// Serve frontend in production (optional placeholder)
// if (process.env.NODE_ENV === 'production') { ... }

server.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
