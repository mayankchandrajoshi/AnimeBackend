import mongoose from "mongoose";

const connectDatabase=async ()=>{
    try {
        const conn = await mongoose.connect(process.env.DB_URI!);
    } catch (error) {
        console.log("Cannot connect to database");
    }
}

export default connectDatabase;