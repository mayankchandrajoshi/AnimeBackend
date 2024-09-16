import { NextFunction, Request, Response } from "express";
import User from "../models/userModel";
import catchAsyncErrors from "../utils/catchAsyncErrors";
import bcrypt from 'bcrypt'
import ErrorHandler from "../utils/errorHandler";
import cloudinary from 'cloudinary';
import passport from "passport";
import { AuthenticatedRequest } from "../interfaces/requestInterface";
import jwt from 'jsonwebtoken';
import { UserInterface } from "../interfaces/userInterface";

export const registerUser = catchAsyncErrors(async(req:Request,res:Response,next:NextFunction)=>{
    
    if(!req.body.avatar||req.body.avatar==="null"){
        return next(new ErrorHandler("Please enter valid photo",400));
    }
    
    const { name, email, password } :{ name:string,email:string,password:string } = req.body;

    const user  = await User.findOne({email});

    if(user) return next(new ErrorHandler("Email already in use",400));

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        height: 150,
        crop: "scale",
    });

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
        name,
        email,
        password: hashedPassword,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.url,
        },
    });

    res.status(200).json(({
        success:true,
        message: 'User registered successfully' 
    }))
})

export const loginUser = catchAsyncErrors(async(req:Request, res:Response, next:NextFunction) => {

        const { email, password } = req.body as { email : string,password : string };

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }

        if (!user.password) {
            return next(new ErrorHandler('Login using other methods', 401));
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return next(new ErrorHandler('Incorrect password.', 401));
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
        
        return res.json({ success: true, token });
})

export const googleLoginCallback = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', async (err: any, user?: UserInterface | false) => {
        if (err) {
            return next(err); 
        }
        const frontendUrl = decodeURIComponent(req.query.state as string);
        
        if (!user) {
            return res.status(400).redirect(`${frontendUrl}?token=null`);
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

        return res.status(200).redirect(`${frontendUrl}?token=${token}`);
    })(req, res, next);
});

export const getUserDetails = catchAsyncErrors(async(req:Request,res:Response,next:NextFunction)=>{
    const { user } = req as AuthenticatedRequest;
    res.status(200).send({
        success : true,
        user
    })
})

export const updateUser = catchAsyncErrors(async(req:Request,res:Response,next:NextFunction)=>{

    const { name,avatar } = req.body as { name?: string, avatar?: string };

    const { user } = req as AuthenticatedRequest;
    
    const updatedUser: {
        name?: string;
        avatar?: {
            public_id: string;
            url: string;
        };
    } = {};

    if(name){
        updatedUser.name  = name
    }

    if(avatar){
        const myCloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatars",
            width: 150,
            crop: "scale",
        });

        if(user.avatar.public_id){
            await cloudinary.v2.uploader.destroy(user.avatar.public_id);
        }

        updatedUser.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.url,
        }
    }

    await User.findByIdAndUpdate(user._id, updatedUser, {
        new: true,
        runValidators: true,
    });

    res.status(200).json(({
        success:true,
        message: 'User updated successfully' 
    }))
})