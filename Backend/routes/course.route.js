import express from "express";
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { createCourse, updateCourse, deleteCourse, getCourses, courseDetails } from "../controllers/course.controller.js";
import { buyCourses } from "../controllers/course.controller.js";
import userMiddleware from "../middleware/user.mid.js"
import adminMiddleware from "../middleware/admin.mid.js";

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Define uploadImageMiddleware
const uploadImageMiddleware = async (req, res, next) => {
    try {
        console.log('Request received:', {
            file: req.file,
            body: req.body
        });

        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                message: "No file uploaded" 
            });
        }

        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'course-thumbnails',
                    width: 400,
                    crop: "scale"
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

        // Add the Cloudinary result to the request object
        req.body.imageUrl = uploadResult.secure_url;
        req.body.imagePublicId = uploadResult.public_id;

        next();
    } catch (error) {
        console.error('Upload middleware error:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Routes
router.post("/upload-image", adminMiddleware, upload.single('file'), uploadImageMiddleware, (req, res) => {
    res.json({
        success: true,
        url: req.body.imageUrl,
        public_id: req.body.imagePublicId
    });
});

router.post("/", 
    adminMiddleware, 
    upload.single('file'), 
    uploadImageMiddleware, 
    createCourse
);
router.put("/update/:courseId", adminMiddleware, updateCourse);
router.delete("/delete/:courseId", adminMiddleware, deleteCourse);
router.get("/courses", getCourses);
router.get("/:courseId", courseDetails);
router.post("/buy/:courseId", userMiddleware, buyCourses);

export default router;
