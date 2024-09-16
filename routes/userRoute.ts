import express, { NextFunction, Request, Response } from 'express'
import passport from 'passport';
import { getUserDetails, googleLoginCallback, loginUser, registerUser, updateUser } from '../controllers/userControllers'
import { isAuthenticated } from '../middleware/auth';
import catchAsyncErrors from '../utils/catchAsyncErrors';

const router = express.Router();

router.post("/register",registerUser);

router.post('/login',loginUser);

router.get('/google', catchAsyncErrors(async (req:Request, res:Response, next:NextFunction) => {
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: req.query.frontendUrl as string
    })(req, res, next);
}));

router.get('/google/callback',googleLoginCallback);

router.get("/me",isAuthenticated,getUserDetails);

router.patch("/user/update",isAuthenticated,updateUser);

export default router;