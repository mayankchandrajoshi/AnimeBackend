import { Request, Response, NextFunction } from 'express';
import ErrorHandler from '../utils/errorHandler';
import jwt from 'jsonwebtoken';
import { UserInterface } from '../interfaces/userInterface';
import catchAsyncErrors from '../utils/catchAsyncErrors';
import User from '../models/userModel';

export const isAuthenticated = catchAsyncErrors(async(req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new ErrorHandler("Please Login to access this resource", 401));
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

    const user = await User.findById(decoded.id).select('-__v');

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    req.user = user as UserInterface;
    next();
})