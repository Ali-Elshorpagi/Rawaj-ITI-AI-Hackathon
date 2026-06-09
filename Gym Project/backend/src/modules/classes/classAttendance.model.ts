import mongoose, { Model, Schema } from "mongoose";
import { IClassAttendance } from "./types";

const classAttendanceSchema = new Schema<IClassAttendance>(
  {
    classId: {
      type: Schema.Types.ObjectId,
      ref: "FitnessClass",
      required: true,
    },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    sessionDate: { type: Date, required: true },
    present: { type: Boolean, required: true },
    markedByTrainerId: {
      type: Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },
  },
  { timestamps: true }
);

classAttendanceSchema.index(
  { classId: 1, memberId: 1, sessionDate: 1 },
  { unique: true }
);

const ClassAttendance: Model<IClassAttendance> =
  mongoose.model<IClassAttendance>("ClassAttendance", classAttendanceSchema);

export default ClassAttendance;
