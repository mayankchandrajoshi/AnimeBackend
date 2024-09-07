import app from './app'
const dotenv = require("dotenv").config({ path: "config/.env" });
import connectDatabase from "./config/database"
import { v2 as cloudinary } from 'cloudinary';

// Handling uncaught exception
process.on("uncaughtException", (err) => {
    console.log("Error: " + err.message);
    console.log("Shutting down the server due to Uncaught Exception ");
    process.exit(1);
});

connectDatabase().then(()=>{
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    const port = process.env.PORT||3000;
    
    const server=app.listen(port,()=>{
        console.log("Server listening on port " + process.env.PORT);
    })

    // Unhandled Promise Rejection
    process.on("unhandledRejection", (err:Error) => {
        console.log("Error : " + err.message);
        console.log("Shutting down the server due to unhandled Promise Rejection");
    
        server.close(() => {
        process.exit(1);
        });
    });
});