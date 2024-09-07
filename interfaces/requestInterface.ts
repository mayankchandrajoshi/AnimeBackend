import { Request } from "express";
import { UserInterface } from "./userInterface";

export interface AuthenticatedRequest extends Request {
    user: UserInterface; 
}