import mongoose from "mongoose";
import File from "../../../modules/File/file.model";
import { deleteFiles, markFilesAsUsed } from "../files";

interface UploadedFile {
  _id: mongoose.Types.ObjectId;
  url: string;
}

/**
 * Extract Cloudinary URL from upload middleware output.
 */
export const extractPhotoUrl = (photoField: unknown): string | undefined => {
  if (!Array.isArray(photoField) || photoField.length === 0) return undefined;
  return (photoField[0] as UploadedFile).url;
};

/**
 * Mark uploaded File records as used after persisting entity photo URL.
 */
export const markUploadedPhoto = async (
  photoField: unknown
): Promise<void> => {
  if (!Array.isArray(photoField) || photoField.length === 0) return;
  const ids = photoField.map(
    (f) => (f as UploadedFile)._id
  ) as unknown as mongoose.Schema.Types.ObjectId[];
  await markFilesAsUsed(ids);
};

/**
 * Delete Cloudinary asset by stored photo URL using existing delete helper.
 */
export const deletePhotoByUrl = async (
  url: string | undefined | null,
  language = "en"
): Promise<void> => {
  if (!url) return;
  const file = await File.findOne({ url });
  if (file) {
    await deleteFiles(
      [file._id as unknown as mongoose.Schema.Types.ObjectId],
      language
    );
  }
};
