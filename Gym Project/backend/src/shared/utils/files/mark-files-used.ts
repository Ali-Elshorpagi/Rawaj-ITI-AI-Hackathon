import File from "../../../modules/File/file.model";
import mongoose from "mongoose";

export const markFilesAsUsed = async (
  filesId: mongoose.Schema.Types.ObjectId[]
) => {
  if (filesId.length === 0) return true;
  await File.updateMany({ _id: { $in: filesId } }, { used: true });

  return true;
};
