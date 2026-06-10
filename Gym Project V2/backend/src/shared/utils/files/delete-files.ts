import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import File from "../../../modules/File/file.model";
import mongoose from "mongoose";
import {
  InternalServerError,
  InvalidFileTypeError,
  ServiceUnavailableError,
} from "../../utils/custom-errors";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

export const deleteImages = async (
  imageIds: mongoose.Schema.Types.ObjectId[],
  language = "en"
) => {
  try {
    const files = await File.find({
      _id: {
        $in: imageIds,
      },
    });
    const publicCloudinaryIds = files.map((file) => file.public_id);
    console.log(publicCloudinaryIds);
    const result = await cloudinary.api.delete_resources(publicCloudinaryIds, {
      resource_type: "image", // Default is 'image', but you can specify 'video', 'raw', etc.
      type: "upload", // Default is 'upload', but you can specify 'private', 'authenticated', etc.
      invalidate: true, // Optional: Invalidate the CDN cache for these resources
    });
    console.log(result);
    await File.deleteMany({
      _id: {
        $in: imageIds,
      },
    });
  } catch (error) {
    throw new ServiceUnavailableError(
      language === "en"
        ? "Error with image service, please try again or contact support"
        : "حدث خطأ في خدمة الصور، يرجى المحاولة لاحقاً أو الإتصال بالدعم الفني"
    );
  }
};

export const deleteFiles = async (
  fileIds: mongoose.Schema.Types.ObjectId[],
  language = "en"
) => {
  try {
    const files = await File.find({ _id: { $in: fileIds } });

    if (files.length === 0) return;

    // Extract public Cloudinary IDs and their resource types
    const cloudinaryDeletions = files.map((file) => ({
      public_id: file.public_id,
      resource_type:
        file.type === "video" ? "video" : file.type === "pdf" ? "raw" : "image",
    }));

    // Delete files from Cloudinary
    const deletePromises = cloudinaryDeletions.map(
      async ({ public_id, resource_type }) => {
        return cloudinary.api.delete_resources([public_id], {
          resource_type,
          type: "upload",
          invalidate: true,
        });
      }
    );

    await Promise.all(deletePromises);

    // Delete records from the database
    await File.deleteMany({ _id: { $in: fileIds } });
  } catch (error) {
    throw new ServiceUnavailableError(
      language === "en"
        ? "Error with file service, please try again or contact support"
        : "حدث خطأ في خدمة الملفات، يرجى المحاولة لاحقاً أو الإتصال بالدعم الفني"
    );
  }
};
