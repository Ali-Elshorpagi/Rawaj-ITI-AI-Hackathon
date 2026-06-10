import { Request, Response, NextFunction } from "express";
import multer from "multer";
import sharp from "sharp";
import Busboy from "busboy";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import dotenv from "dotenv";
import heicConvert from "heic-convert";
import File from "../../../modules/File/file.model";
import mongoose from "mongoose";
import {
  InternalServerError,
  InvalidFileTypeError,
} from "../../utils/custom-errors";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

// Configure Multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // Increased to 50MB for videos & PDFs
  fileFilter: (req, file, cb) => {
    if (
      !file.mimetype.startsWith("image/") &&
      !file.mimetype.startsWith("video/") &&
      file.mimetype !== "application/pdf"
    ) {
      return cb(
        new InvalidFileTypeError("Only images, videos, and PDFs are allowed!")
      );
    }
    cb(null, true);
  },
});

// Helper function to convert HEIC to JPEG
const convertHEIC = async (buffer: Buffer): Promise<Buffer> => {
  try {
    const arrayBuffer = await heicConvert({
      buffer,
      format: "JPEG",
    });
    return Buffer.from(arrayBuffer);
  } catch (error) {
    throw new InvalidFileTypeError(
      "Failed to convert HEIC image to JPEG format."
    );
  }
};

// Helper function to compress and correct image orientation
const compressImage = async (
  buffer: Buffer,
  mimetype: string
): Promise<Buffer> => {
  try {
    const imageProcessor = sharp(buffer).rotate(); // Correct orientation
    switch (mimetype) {
      case "image/jpeg":
      case "image/jpg":
        return await imageProcessor.jpeg({ quality: 80 }).toBuffer();
      case "image/png":
        return await imageProcessor
          .png({ quality: 80, compressionLevel: 9 })
          .toBuffer();
      case "image/webp":
        return await imageProcessor.webp({ quality: 80 }).toBuffer();
      case "image/svg+xml":
        return buffer;
      default:
        throw new InvalidFileTypeError(`Unsupported image format: ${mimetype}`);
    }
  } catch (error) {
    throw new InternalServerError(`Image compression failed`);
  }
};

// Helper function to upload an image to Cloudinary
const uploadImageToCloudinary = async (
  buffer: Buffer,
  ownerId: string
): Promise<any> => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "uploads" },
        (error, result) => {
          if (error) return reject(new Error("Cloudinary upload failed."));
          resolve({
            asset_id: result?.asset_id ?? "",
            public_id: result?.public_id ?? "",
            url: result?.url ?? "",
            type: "image",
            owner: new mongoose.Types.ObjectId(ownerId),
          });
        }
      );
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  } catch (error) {
    throw new InternalServerError(`Failed to upload image to Cloudinary`);
  }
};

const uploadVideoToCloudinary = async (
  buffer: Buffer,
  ownerId: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "uploads/videos", resource_type: "video" },
      (error, result) => {
        if (error) return reject(new Error("Cloudinary video upload failed."));
        resolve({
          asset_id: result?.asset_id ?? "",
          public_id: result?.public_id ?? "",
          url: result?.secure_url ?? "",
          type: "video",
          owner: new mongoose.Types.ObjectId(ownerId),
        });
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Upload PDF to Cloudinary
const uploadPdfToCloudinary = async (
  buffer: Buffer,
  ownerId: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "uploads/pdfs", resource_type: "raw" },
      (error, result) => {
        if (error) return reject(new Error("Cloudinary PDF upload failed."));
        resolve({
          asset_id: result?.asset_id ?? "",
          public_id: result?.public_id ?? "",
          url: result?.secure_url ?? "",
          type: "pdf",
          owner: new mongoose.Types.ObjectId(ownerId),
        });
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Main middleware to process images
const processImagesMiddleware =
  (fields: string[]) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.files || typeof req.files !== "object") {
        for (let key of fields) {
          req.body[key] = [];
        }
        return next();
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      for (let field of fields) {
        const uploadPromises =
          files[field]?.map(async (file) => {
            let processedBuffer: Buffer;

            // Convert HEIC images if needed
            if (
              file.mimetype === "image/heic" ||
              file.mimetype === "image/heif"
            ) {
              processedBuffer = await convertHEIC(file.buffer);
            } else {
              processedBuffer = await compressImage(file.buffer, file.mimetype);
            }

            // Upload to Cloudinary
            return await uploadImageToCloudinary(processedBuffer, req.user.id);
          }) || [];

        // Wait for all uploads and save results to the database
        const uploadedFiles = await Promise.all(uploadPromises);
        req.body[field] = await File.insertMany(uploadedFiles);
      }

      next();
    } catch (error) {
      next(error); // Pass the error to the error-handling middleware
    }
  };

const processVideosMiddleware =
  (fields: string[]) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.files || typeof req.files !== "object") {
        for (let key of fields) req.body[key] = [];
        return next();
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      for (let field of fields) {
        const uploadPromises =
          files[field]?.map(async (file) => {
            return await uploadVideoToCloudinary(file.buffer, req.user.id); // Direct upload
          }) || [];

        req.body[field] = await File.insertMany(
          await Promise.all(uploadPromises)
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };

const processPdfsMiddleware =
  (fields: string[]) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.files || typeof req.files !== "object") {
        for (let key of fields) req.body[key] = [];
        return next();
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      for (let field of fields) {
        const uploadPromises =
          files[field]?.map(async (file) => {
            return await uploadPdfToCloudinary(file.buffer, req.user.id); // Direct upload
          }) || [];

        req.body[field] = await File.insertMany(
          await Promise.all(uploadPromises)
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };

const processUpload =
  (fields: string[]) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.files || typeof req.files !== "object") {
        for (let key of fields) req.body[key] = [];
        return next();
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      for (let field of fields) {
        const uploadPromises =
          files[field]?.map(async (file) => {
            let processedBuffer = file.buffer;
            let uploadFunction;

            // Handle different file types
            if (file.mimetype.startsWith("image/")) {
              if (
                file.mimetype === "image/heic" ||
                file.mimetype === "image/heif"
              ) {
                processedBuffer = await convertHEIC(file.buffer);
              } else {
                processedBuffer = await compressImage(
                  file.buffer,
                  file.mimetype
                );
              }
              uploadFunction = uploadImageToCloudinary;
            } else if (file.mimetype.startsWith("video/")) {
              uploadFunction = uploadVideoToCloudinary;
            } else if (file.mimetype === "application/pdf") {
              uploadFunction = uploadPdfToCloudinary;
            } else {
              throw new InvalidFileTypeError(
                `Unsupported file format: ${file.mimetype}`
              );
            }

            // Upload the file
            return await uploadFunction(processedBuffer, req.user.id);
          }) || [];

        req.body[field] = await File.insertMany(
          await Promise.all(uploadPromises)
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };

const handleUploadAny = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files || typeof req.files !== "object") {
      return next();
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const body = req.body;

    // Parse dynamic installmentsOptions structure
    const installmentsOptions: Record<string, any>[] = [];

    // Group text fields into the installmentsOptions array
    Object.keys(body)
      .filter((key) => key.startsWith("installmentsOptions"))
      .forEach((key) => {
        const match = key.match(/installmentsOptions\[(\d+)\]\[(\w+)\]/);
        if (match) {
          const [_, index, field] = match;
          if (!installmentsOptions[+index]) installmentsOptions[+index] = {};
          installmentsOptions[+index][field] = body[key];
        }
      });

    // Process files and upload to Cloudinary
    await Promise.all(
      Object.entries(files).map(async ([fieldname, fileArray]) => {
        for (const file of fileArray) {
          const match = fieldname.match(
            /installmentsOptions\[(\d+)\]\[image\]/
          );
          if (match) {
            const index = +match[1];

            // Compress or convert HEIC files
            let processedBuffer: Buffer;
            if (
              file.mimetype === "image/heic" ||
              file.mimetype === "image/heif"
            ) {
              processedBuffer = await convertHEIC(file.buffer);
            } else {
              processedBuffer = await compressImage(file.buffer, file.mimetype);
            }

            // Upload to Cloudinary
            const uploadedImage = await uploadImageToCloudinary(
              processedBuffer,
              req.user.id
            );

            // Attach uploaded image info to installmentsOptions
            if (!installmentsOptions[index]) installmentsOptions[index] = {};
            installmentsOptions[index].image = uploadedImage;
          }
        }
      })
    );

    // Remove empty slots in the array
    req.body.installmentsOptions = installmentsOptions.filter(
      (option) => option !== undefined
    );

    next();
  } catch (error) {
    next(error); // Pass errors to error-handling middleware
  }
};

// Export both multer upload and the middleware
export {
  upload,
  processImagesMiddleware,
  handleUploadAny,
  processUpload,
  processPdfsMiddleware,
  processVideosMiddleware,
};
