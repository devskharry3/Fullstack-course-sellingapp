import {Course} from "../models/course.models.js";
import { Purchase } from "../models/purchase.model.js";

export const createCourse = async (req, res) => {
    const adminId = req.adminId;
    const { title, description, price } = req.body;
    
    try {
        // Validate required fields
        if (!title || !description || !price || !req.body.imageUrl) {
            return res.status(400).json({ 
                success: false, 
                message: "All fields including image are required" 
            });
        }

        // Convert price to a number
        const priceNumber = Number(price);
        if (isNaN(priceNumber) || priceNumber <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Price must be a valid number greater than 0" 
            });
        }

        // Create course data
        const courseData = {
            title,
            description,
            price: priceNumber,
            image: {
                url: req.body.imageUrl,
                public_id: req.body.imagePublicId
            },
            creatorId: adminId
        };

        // Save course to database
        const course = await Course.create(courseData);

        // Return success response
        res.status(201).json({
            success: true,
            message: "Course created successfully",
            course
        });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ 
            success: false, 
            message: "Error creating course" 
        });
    }
};

export const updateCourse = async(req, res) => {
    const adminId = req.adminId;
    const {courseId} = req.params; 
    
    console.log('Update request received:', {
        adminId,
        courseId,
        body: req.body
    });
    
    // Add validation for courseId
    if (!courseId) {
        return res.status(400).json({
            success: false,
            message: "No course ID provided"
        });
    }

    const {title, description, price, imageUrl, imagePublicId} = req.body;
    
    // Add validation for required fields
    if (!title || !description || !price) {
        return res.status(400).json({
            success: false,
            message: "Title, description, and price are required"
        });
    }

    try {
        const courseSearch = await Course.findById(courseId);
        if(!courseSearch) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }
        
        // Create update object with basic fields
        const updateData = {
            title,
            description,
            price: Number(price)
        };

        // Only update image if new image data is provided
        if (imageUrl && imagePublicId) {
            updateData.image = {
                public_id: imagePublicId,
                url: imageUrl
            };
        }

        console.log('Updating course with data:', updateData);

        const course = await Course.findOneAndUpdate(
            {
                _id: courseId,
                creatorId: adminId,
            }, 
            updateData,
            { 
                new: true,
                runValidators: true 
            }
        );

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found or you don't have permission to update it"
            });
        }

        res.status(200).json({
            success: true,
            message: "Course updated successfully",
            course
        });
    } catch(error) {
        console.error("Error in course updating:", error);
        res.status(500).json({
            success: false,
            message: "Error updating course",
            error: error.message
        });
    }
}

export const deleteCourse = async(req,res) => {
    const adminId=req.adminId
    const {courseId} = req.params;
    try{ 
        const course = await Course.findOneAndDelete({
            _id: courseId,
            creatorId: adminId,
        });
        if(!course) {
            return res.status(404).json({errors: "can't delete, created by other admin"});
        }
        res.status(200).json({message:"Course deleted succesfully"})

    } catch(error) {
        res.status(500).json({errors:"Error in course deleting"})
        console.log("Error in course deleting", error);

    }
}

export const getCourses = async(req,res) => {
    try {
        const courses= await Course.find({})
        res.status(200).json({
            success: true,
            courses: courses
        });

    } catch(error) {
        res.status(500).json({errors: "Error in getting courses"});
        console.log("error to get courses", error);

    }
}

export const courseDetails= async (req, res) => {
    const {courseId} = req.params;
    try{
        const course = await Course.findById(courseId);
        if(!course) {
            return res.status(404).json({error: "Course not found"});
        }
        res.status(200).json({course});
    }catch(error) {
        res.status(500).json({errors: "Error in getting course details"});
        console.log("Error in course datils ", error)
    }
}

import Stripe from "stripe"
import config from '../config.js';
const stripe=new Stripe(config.STRIPE_SECRET_KEY);
console.log(config.STRIPE_SECRET_KEY)
export const buyCourses = async(req,res) => {
    const {userId}=req;
    const {courseId} = req.params;
    
    try{
        const course = await Course.findById(courseId);
        if(!course) {
            return res.status(404).json({errors: "Course not found"});
        }
        const existingPurchase=await Purchase.findOne({userId,courseId})
        if(existingPurchase){
            return res.status(400).json({errors: "User has already purchased this course"});
        }

        //stripe payment goes here 
        const amount =course.price;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: "usd",
            payment_method_types: ["card"],
          });

        res 
        .status(201) 
        .json({message: "Course purchased successfully", 
        course,
        clientSecret: paymentIntent.client_secret
    });
        
    } catch(error) {
        res.status(500).json({errors: "Error in course buying"});
        console.log("error in course buying", error)

    }
}