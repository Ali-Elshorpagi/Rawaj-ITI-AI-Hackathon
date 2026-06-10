import mongoose, { Schema, Model } from "mongoose";
import { IFile } from "./types";

const fileSchema: Schema<IFile> = new Schema<IFile>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    asset_id: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["image", "pdf", "video"],
      required: true,
    },
  },
  { timestamps: true }
);

/*
File model will be used only on as a middleware to upload files to the server and save their paths in the database.

*/

const File: Model<IFile> = mongoose.model<IFile>("File", fileSchema);

export default File;
