import { Request, Response, NextFunction } from "express";

export const languageMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let language = req.headers["Accept-Language"] || "en";
  if (language !== "en" && language !== "ar") language = "en";

  req.language = language;
  next();
};
