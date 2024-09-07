import { Document } from "mongoose";

// Extend the Mongoose Document interface to include User fields
export interface UserInterface extends Document {
    _id: string;
    name: string;
    email: string;
    password?: string;
    googleId?: string;
    avatar: {
        url: string;
        public_id?: string;
    };
    role: "user" | "admin";
    createdAt: Date;
    updatedAt: Date;
}
