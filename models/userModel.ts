import mongoose from 'mongoose'
import validator from 'validator'
import { UserInterface } from '../interfaces/userInterface';

const userSchema = new mongoose.Schema<UserInterface>({
    name: {
        type: String,
        required: [true, "Please enter user name"],
        maxLength: [30, "Name cannot exceed 30 characters"],
        minLength: [3, "Name cannot be less than 3 characters"],
    },
    email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        index: {
            unique: true,
            collation: { locale: 'en', strength: 2 }
        },
        validate: [validator.isEmail, "Please Enter a valid Email"],
    },
    password: {
        type: String,
        minLength: [8, "Password should be greater than 8 characters"],
        select: false,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    avatar: {
        url: { 
            type: String ,
            required : true
        },
        public_id: { type: String },
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
},{ timestamps: true });

export default mongoose.model<UserInterface>("user", userSchema);