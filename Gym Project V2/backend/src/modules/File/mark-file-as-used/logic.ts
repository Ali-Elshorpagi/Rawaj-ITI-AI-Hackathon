import { mongo } from "mongoose";
import { NotFoundError } from "../../../shared/utils/custom-errors";
import File from "../file.model";
import { Input, inputSchema } from "./input";

export class MarkFileAsUsedLogic {
  async markFileAsUsed(data: Input, session: mongo.ClientSession) {
    const { fileIds, userId } = inputSchema.parse(data);

    const files = await File.find({
      _id: { $in: fileIds },
    });

    if (!files || files.length === 0) {
      throw new NotFoundError("File not found");
    }

    for (let file of files) {
      if (file.owner.toString() === userId.toString()) {
        file.used = true;
        console.log(file);
        await file.save({ session });
      }
    }

    return "Files marked as used";
  }
}
