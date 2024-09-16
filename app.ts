import express from 'express'
import fileUpload from 'express-fileupload'
import passport from 'passport'
import errorMiddleware from './middleware/error'
import userRoutes from './routes/userRoute'
import connectDatabase from './config/database'
require("dotenv").config({ path: "config/.env" });
require('./config/passport');
import { v2 as cloudinary } from 'cloudinary';
import { CorsOptionsDelegate } from 'cors'
import cors from 'cors'
import ErrorHandler from './utils/errorHandler'

const app = express();

connectDatabase().then(()=>{
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
});

const allowedOrigins = process.env.ALLOWED_ORIGINS!.split(',')

const corsOptions: CorsOptionsDelegate = (req, callback) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        callback(null, { origin: true, credentials: true });
    }
    else if (!origin) {
        callback(null, { origin: false }); 
    }
    else {
        callback(new ErrorHandler('Not allowed by CORS',403));
    }
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(fileUpload());
app.use(passport.initialize());

app.use("/api/v1",userRoutes);

app.use(errorMiddleware)

export default app