import { NextFunction, Request, Response } from "express";
import { HttpException } from "./exceptions/root";
import { InternalException } from "./exceptions/internal-exception";
import { ZodError } from "zod";
import { BadRequestsException } from "./exceptions/bad-requests";

export const errorHandler = (method: Function) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await method(req, res, next);
    } catch (error) {
      let exception: HttpException;
      if (error instanceof HttpException) {
        exception = error;
      } else if(error instanceof ZodError) {
        exception = new BadRequestsException('Unprocessable entity.', error);
      } else {
        exception = new InternalException('Something went wrong', error);
      }
      next(exception);
    }
  }
}
