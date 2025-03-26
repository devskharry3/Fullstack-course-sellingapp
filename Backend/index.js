import dotenv from 'dotenv';
dotenv.config(); // Ensure env variables are loaded at the start

// Add environment variable validation at the beginning
const requiredEnvVars = [
  'PORT',
  'MONGO_URI',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'FRONTEND_URL'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import express from 'express';
import cors from 'cors';
import courseRoute from './routes/course.route.js';
import userRoute from './routes/user.route.js';
import adminRoute from './routes/admin.route.js';
import cookieParser from 'cookie-parser';
import orderRoute from './routes/order.route.js'

const app = express();
const port = process.env.PORT || 3000;
const DB_URI = process.env.MONGO_URI;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
}));

// ✅ Fix Cloudinary Config - Ensure Correct ENV Names
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Fix MongoDB Connection Function
async function connectDB() {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}
connectDB();

// Routes
app.use('/api/v1/course', courseRoute);
app.use('/api/v1/user', userRoute);
app.use('/api/v1/admin', adminRoute);    
app.use('/api/v1/order', orderRoute);
// Root Route
app.get('/', (req, res) => {
  res.send('Server is running...');
});

// Add this to your Express app setup
app.use('/uploads', express.static('uploads'));

// Add a catch-all route for handling 404 errors
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});