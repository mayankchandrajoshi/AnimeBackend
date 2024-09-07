import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../interfaces/requestInterface';
import ErrorHandler from '../utils/errorHandler';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return next(new ErrorHandler("Please Login to access this resource", 401));
};