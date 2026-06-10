import { Request, Response, NextFunction } from "express";
import { upload, processImagesMiddleware } from "./uploadCloudinary";

const isMultipart = (req: Request): boolean =>
  (req.headers["content-type"] ?? "").includes("multipart/form-data");

/**
 * Run Cloudinary image upload only for multipart requests.
 * For JSON requests, preserve req.body and default image fields to [].
 */
export const optionalImageUpload =
  (fields: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!isMultipart(req)) {
      req.body = req.body ?? {};
      for (const field of fields) {
        if (!req.body[field]) {
          req.body[field] = [];
        }
      }
      next();
      return;
    }

    const multerFields = fields.map((name) => ({ name, maxCount: 1 }));
    upload.fields(multerFields)(req, res, (err) => {
      if (err) return next(err);
      processImagesMiddleware(fields)(req, res, next);
    });
  };
