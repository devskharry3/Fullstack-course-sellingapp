import { User } from '../models/user.model.js';
import bcrypt from "bcryptjs";
import { z } from "zod";
import jwt from "jsonwebtoken"
import { config } from 'dotenv';
import { Purchase } from '../models/purchase.model.js';
import { Course } from'../models/course.models.js'


export const signup = async(req,res) => {
    const {firstName, lastName,email,password}=req.body; 

    const userSchema = z.object({
        firstName:z
        .string()
        .min(3, {message:"firstName must be at least 3 char length"}),
        lastName:z
        .string()
        .min(3, {message: "lastName must be at least 3 char length"}),
        email:z.string().email(),
        password:z
        .string()
        .min(6, {message: "password must be at least 6 char length"}),
    })

    const validateData = userSchema.safeParse(req.body);
    if(!validateData.success){
        return res.status(400).json({error: validateData.error.issues.map((err) =>err.message).join(", ")})
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try{
        const existingUser = await User.findOne({email: email});
        if(existingUser){
            //console.log("User already exists"); // Debug log
            return res.status(400).json({error: "User already exists"});
        }
        const newUser=new User({
            firstName, 
            lastName, 
            email, 
            password: hashedPassword});
        await newUser.save();
        res.status(201).json({message: "Signup succeeded", newUser});
    } catch (error) {
        console.log("Error in signup:", error); // Debug log
        res.status(500).json({error: "Error in signup"});
    }
};

export const login = async(req,res) => {
    const {email, password} = req.body;
    try{
        const user = await User.findOne({email: email});
        
        if(!user) {
            return res.status(403).json({errors: "Invalid credentials"});
        }
        
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect) {
            return res.status(403).json({errors: "Invalid credentials"});
        }

        // Get purchased courses
        const purchases = await Purchase.find({userId: user._id});
        const purchasedCourseIds = purchases.map(p => p.courseId);
        
        // Add purchased courses to user object for frontend
        const userWithPurchases = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            purchasedCourses: purchasedCourseIds
        };

        //jwt code
        const token = jwt.sign({
            id: user._id,
        },  
        process.env.JWT_USER_PASSWORD,
        {expiresIn: "1d"}
        );
        
        const cookieOptions = {
            expires: new Date(Date.now() + 24*60*60*1000), // 1 day
            httpOnly: true, //cant be accessed via js directly
            secure: process.env.NODE_ENV === "production", //true for https only
            sameSite:"Strict" //CSRF attacks
        };
        
        res.cookie("jwt", token, cookieOptions);
        res.status(201).json({
            message: "Login successful", 
            user: userWithPurchases, 
            token
        });
    } catch(error) {
        console.log("error in login", error);
        res.status(500).json({errors: "Error in login"});
    }
}

export const logout = async(req,res) => {
    try{
        // No need to check for JWT cookie since we're using Bearer token in headers
        // Instead, we'll just send a success response
        res.status(200).json({message: "Logged out successfully"});
    } catch(error) {
        res.status(500).json({errors: "Error in logout"});
        console.log("Error in logout", error) 
    }
} 

export const purchases = async (req, res) => {
    const userId = req.userId;

    try {
        const purchased = await Purchase.find({userId})

        if (!purchased || purchased.length === 0) {
            return res.status(200).json({ 
                message: "No purchases found",
                courseData: [] 
            });
        }

        let purchasedCourseId = purchased.map(p => p.courseId);
        
        const courseData = await Course.find({
            _id: { $in: purchasedCourseId }
        });
        
        console.log("Found purchased courses:", courseData);
        
        // Update user with purchased courses if needed
        await User.findByIdAndUpdate(
            userId,
            { $addToSet: { purchasedCourses: { $each: purchasedCourseId } } },
            { new: true }
        );

        res.status(200).json({ courseData });
    } catch(error) {
        console.log("Error in purchase", error);
        res.status(500).json({errors: "Error in purchases"});
    }
}

  
  

