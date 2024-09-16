import express from 'express'
import fileUpload from 'express-fileupload'
import passport from 'passport'
import errorMiddleware from './middleware/error'
import userRoutes from './routes/userRoute'
import connectDatabase from './config/database'
require("dotenv").config({ path: "config/.env" });
require('./config/passport');
import { v2 as cloudinary } from 'cloudinary';

const app = express();

connectDatabase().then(()=>{
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(fileUpload());
app.use(passport.initialize());

app.use("/api/v1",userRoutes);

app.use(errorMiddleware)

export default app