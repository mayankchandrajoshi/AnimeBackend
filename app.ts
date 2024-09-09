import express from 'express'
import cors, { CorsOptionsDelegate } from 'cors'
import fileUpload from 'express-fileupload'
import expressSession from 'express-session'
import passport from 'passport'
import MongoStore from 'connect-mongo';
import errorMiddleware from './middleware/error'
import userRoutes from './routes/userRoute'
import ErrorHandler from './utils/errorHandler'
require("dotenv").config({ path: "config/.env" });
require('./config/passport');

const app = express();

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(expressSession({ 
    secret: process.env.EXPRESS_SESSION_KEY!,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DB_URI!,
        collectionName: 'sessions',
        ttl : parseInt(process.env.MONGODB_TTL!,10) || 3 * 24 * 60  * 60
    }),
    cookie: { 
        httpOnly : true,
        maxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE!, 10) || 3 * 24 * 60 * 60 * 1000,
        sameSite: 'none'
    }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1",userRoutes);

app.use(errorMiddleware)

export default app