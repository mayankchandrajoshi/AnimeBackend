import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcrypt';
import User from '../models/userModel';

// Local strategy for email and password
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return done(null, false, { message: 'Incorrect email.' });
        }

        if (!user.password) {
            return done(null, false, { message: 'Please Enter password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

// Google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: '/api/v1/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = new User({
                name: profile.displayName,
                email: profile.emails?.[0].value,
                googleId: profile.id,
                avatar: {
                    url : profile.photos?.[0].value
                },
            });
            await user.save({validateBeforeSave:true});
        }
        done(null, user);
    } catch (err) {
        done(err, undefined);
    }
}));

// Serialize and deserialize user
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});