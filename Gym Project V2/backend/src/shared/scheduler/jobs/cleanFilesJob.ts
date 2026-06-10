import Agenda from "agenda";
import File from "../../../modules/File/file.model";
import { deleteFiles } from "../../utils/files";
import mongoose from "mongoose";

export const JOB_NAME = "clean_files";

export default (agenda: Agenda) => {
  agenda.define(JOB_NAME, async () => {
    console.log("🧹 Starting daily cleanup...");
    const files = await File.find({
      used: false,
    }).limit(500);
    await deleteFiles(
      files.map((f) => f._id as mongoose.Schema.Types.ObjectId)
    );
  });
};
