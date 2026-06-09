import { MarkFileAsUsedLogic } from "./mark-file-as-used";
import { MarkFileAsUnusedLogic } from "./mark-files-as-unused";
import { mongo } from "mongoose";
import File from "./file.model";
import { deleteFiles } from "../../shared/utils/files/delete-files";
import { NotFoundError } from "../../shared/utils/custom-errors";
import mongoose from "mongoose";

export class FileService {
  markFileAsUsedLogic: MarkFileAsUsedLogic;
  markFilesAsUnusedLogic: MarkFileAsUnusedLogic;
  constructor() {
    this.markFileAsUsedLogic = new MarkFileAsUsedLogic();
    this.markFilesAsUnusedLogic = new MarkFileAsUnusedLogic();
  }

  async deleteFile(fileId: string, userId: string) {
    const file = await File.findById(fileId);
    if (!file) throw new NotFoundError("fileNotFound");
    if (file.owner.toString() !== userId) throw new NotFoundError("fileNotFound");
    await deleteFiles([file._id as unknown as mongoose.Schema.Types.ObjectId]);
  }

  async markFileAsUsed(
    fileIds: string[],
    userId: string,
    session: mongo.ClientSession
  ) {
    console.log("markFileAsUsed", fileIds, userId);
    return this.markFileAsUsedLogic.markFileAsUsed(
      { fileIds, userId },
      session
    );
  }

  async markFilesAsUnused(
    fileIds: string[],
    userId: string,
    session: mongo.ClientSession
  ) {
    return this.markFilesAsUnusedLogic.markFilesAsUnused(
      { fileIds, userId },
      session
    );
  }
}
