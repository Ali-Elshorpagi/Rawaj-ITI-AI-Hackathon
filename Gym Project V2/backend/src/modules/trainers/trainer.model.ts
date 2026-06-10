import mongoose, { Model, Schema } from "mongoose";
import { ITrainer } from "./types";

const trainerSchema = new Schema<ITrainer>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specialization: { type: String, required: true },
    bio: { type: String, default: "" },
    photo: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Trainer: Model<ITrainer> = mongoose.model<ITrainer>(
  "Trainer",
  trainerSchema
);

export default Trainer;
