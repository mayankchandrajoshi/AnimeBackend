import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorHandler";

const error = (err:any, req: Request, res: Response, next: NextFunction) => {

    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;

    // MongoDb Errors
    if(err.name=="CastError"){
        err.message="Resource not found.Invalid "+err.path;
        err.statusCode=400;
    }

    // Mongoose duplicate key error
    if(err.code==11000){
        err.message=`Duplicate ${Object.keys(err.keyValue)} entered`;
        err.statusCode=400;
    }

    // JWT Expired error
    if(err.name == 'TokenExpiredError') {
        err.message = "Please Login again.";
        err.statusCode = 401;
    }

    // Invalid JWT error
    if (err.name === "JsonWebTokenError") {
        err.message = `Invalid Login session. Please login again.`;
        err.statusCode=400;
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
};

export default error