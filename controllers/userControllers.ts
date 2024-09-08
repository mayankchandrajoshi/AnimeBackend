import { NextFunction, Request, Response } from "express";
import User from "../models/userModel";
import catchAsyncErrors from "../utils/catchAsyncErrors";
import bcrypt from 'bcrypt'
import ErrorHandler from "../utils/errorHandler";
import cloudinary from 'cloudinary';
import passport from "passport";
import { AuthenticatedRequest } from "../interfaces/requestInterface";

export const registerUser = catchAsyncErrors(async(req:Request,res:Response,next:NextFunction)=>{
    
    if(!req.body.avatar||req.body.avatar==="null"){
        return next(new ErrorHandler("Please enter valid photo",400));
    }

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        height: 150,
        crop: "scale",
    });
    
    const { name, email, password } :{ name:string,email:string,password:string } = req.body;

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
    passport.authenticate('local', (err:any, user?:Express.User|false, info?:{message:string}) => {
        if (err) {
            return next(err); 
        }
        if (!user) {
            return res.status(400).json({ success: false, message: info?.message });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err); 
            }
            return res.json({ success: true, message: 'Logged in successfully' });
        });
    })(req, res, next);
})

export const googleLoginCallback = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', async (err: any, user?: Express.User | false) => {
        if (err) {
            return next(err); 
        }
        const frontendUrl = decodeURIComponent(req.query.state as string);
        
        if (!user) {
            return res.status(200).redirect(`${frontendUrl}?login_successful=false`);
        }

        req.logIn(user, (err) => {
            if (err) {
                return next(err); 
            }
            return res.status(200).redirect(`${frontendUrl}?login_successful=true`);
        });
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

export const logoutUser = catchAsyncErrors(async(req:Request,res:Response,next:NextFunction) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.session.destroy((err) => {
            if (err) {
                return next(err);
            }
            res.clearCookie('connect.sid');
            return res.status(200).json({ success: true, message: 'Logged out successfully' });
        });
    });
})