import mongoose from "mongoose";

let isConnected = false;

const connectDatabase=async ()=>{
    if (isConnected) return;
    try {
        await mongoose.connect(process.env.DB_URI!);
        isConnected = true;
        console.log("Database connected");    
    } catch (error) {
        console.log("Cannot connect to database");
    }
}

export default connectDatabase;