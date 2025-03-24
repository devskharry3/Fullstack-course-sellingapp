import mongoose from "mongoose"; 

const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true,
    },
    lastName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique: true,
    },
    password: {
        type:String,
        required:true,
    },
    purchasedCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    }]
});

export const User=mongoose.model("User", userSchema);
