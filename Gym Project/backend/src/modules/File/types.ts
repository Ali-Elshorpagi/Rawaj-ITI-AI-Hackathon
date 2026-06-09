import mongoose, { Document } from "mongoose";

export interface IFile extends Document {
  owner: mongoose.Schema.Types.ObjectId;
  asset_id: string;
  public_id: string;
  url: string;
  type: "image" | "pdf" | "video";
  used: boolean;
}
