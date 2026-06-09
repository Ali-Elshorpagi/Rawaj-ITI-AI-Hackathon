import mongoose, { Document } from "mongoose";

export interface ITrainer extends Document {
  userId: mongoose.Types.ObjectId;
  specialization: string;
  bio?: string;
  photo?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
