import mongoose, { Model, Schema } from "mongoose";
import { IFitnessClass } from "./types";

const scheduleSchema = new Schema(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const fitnessClassSchema = new Schema<IFitnessClass>(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    trainerId: {
      type: Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },
    schedule: { type: [scheduleSchema], default: [] },
    capacity: { type: Number, required: true, min: 1 },
    location: { type: String, required: true },
    coverImage: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const FitnessClass: Model<IFitnessClass> = mongoose.model<IFitnessClass>(
  "FitnessClass",
  fitnessClassSchema
);

export default FitnessClass;
