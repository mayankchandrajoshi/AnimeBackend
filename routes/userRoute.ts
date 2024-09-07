import express from 'express'
import passport from 'passport';
import { googleLoginCallback, loginUser, logoutUser, registerUser, updateUser } from '../controllers/userControllers'
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

router.post("/register",registerUser);

router.post('/login',loginUser);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',googleLoginCallback);

router.patch("/user/update",isAuthenticated,updateUser);

router.get("/logout",isAuthenticated,logoutUser);

export default router;