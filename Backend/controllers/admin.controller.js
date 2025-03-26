import { Admin } from '../models/admin.model.js';
import bcrypt from "bcryptjs";
import { z } from "zod";
import jwt from "jsonwebtoken"
export const signup = async(req,res) => {
    const {firstName, lastName,email,password}=req.body; 

    const adminSchema = z.object({
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

    const validateData = adminSchema.safeParse(req.body);
    if(!validateData.success){
        return res.status(400).json({errors: validateData.error.issues.map((err) =>err.message)})
    }

    const hashedPassword = await bcrypt.hash(password, 10);



try{
    const existingAdmin = await Admin.findOne({email: email});
    if(existingAdmin){
        return res.status(400).json({error: "Admin already exists"});
    }
    const newAdmin=new Admin({
        firstName, 
        lastName, 
        email, 
        password: hashedPassword});
    await newAdmin.save();
    res.status(201).json({message: "Signup succeeded", newAdmin});
} catch (error) {
    res.status(500).json({error: "Error in signup"});
    console.log("Error in signup", error);
}
};

export const login = async(req,res) => {
    const {email, password} = req.body;
    try{

        const admin=await Admin.findOne({email: email});
        const isPasswordCorrect = await bcrypt.compare(password, admin.password)

        if(!admin || !isPasswordCorrect) {
            return res.status(403).json({errors: "Invalid credentials"});
        }

        //jwt code
        const token = jwt.sign({
            id: admin._id,
            
        },  
        process.env.JWT_ADMIN_PASSWORD,
        {expiresIn: "1d"}
    );
    const cookieOptions = {
        expires: new Date(Date.now() + 24*60*60*1000), // 1 day
        httpOnly: true, //cant be accessed via js directly
        secure: process.env.NODE_ENV === "production", //true for https only
        sameSite:"Strict" //CSRF attacks
    };
        res.cookie("jwt", token, cookieOptions)
        res.status(201).json({message: "Login successful", admin, token});

    }catch(error) {
        res.status(500).json({errors: "Error in login"});
        console.log("error in login", error);

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
