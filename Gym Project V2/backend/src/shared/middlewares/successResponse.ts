import { Request, Response, NextFunction } from "express";

export const successMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.sendSuccess = (
    message: string,
    data: unknown = null,
    statusCode: number = 200
  ): void => {
    res.status(statusCode).json({
      success: true,
      message,
      data,
      statusCode,
    });
  };

  next();
};
