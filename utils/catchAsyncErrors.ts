import { NextFunction, Request, Response } from "express";

type AsyncController<T extends Request = Request> = (req: T, res: Response, next: NextFunction) => Promise<any>

const catchAsyncErrors = <T extends Request = Request>(controller:AsyncController<T>)=>(req:T,res:Response,next:NextFunction) => {
    Promise.resolve(controller(req,res,next)).catch((err)=>{
        next(err);
    });
}

export default catchAsyncErrors