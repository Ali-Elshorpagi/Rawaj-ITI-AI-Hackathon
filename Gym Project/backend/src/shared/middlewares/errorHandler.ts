import { Request, Response, NextFunction } from "express";
import { BaseError, ValidationError } from "../utils/custom-errors";
import multer from "multer";
import { ZodError } from "zod";
import logger from "../utils/logger";

export const errorHandler = (
  err: Error | BaseError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.log(err);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        success: false,
        error: req.t("errors.file_size_limit_exceeded"),
        statusCode: 400,
      });
      return;
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      res.status(400).json({
        success: false,
        error: req.t("errors.file_size_limit_exceeded"),
        statusCode: 400,
      });
      return;
    }
  }

  // If the error is a BaseError, use its status code and message
  if (err instanceof BaseError) {
    logger.error(err.message);
    res.status(err.statusCode).json({
      success: false,
      message: req.t(`errors.${err.message}`),
      statusCode: err.statusCode,
    });
    return;
  }
  if (err instanceof ZodError) {
    logger.error(err.message);

    const errorMsg = err.issues[0].message;
    res.status(422).json({
      success: false,
      message: req.t(`validation.${errorMsg}`),
      statusCode: 422,
    });
    return;
  }

  logger.error(err.message);
  res.status(500).json({
    success: false,
    message: "Something went wrong",
    statusCode: 500,
  });
};
