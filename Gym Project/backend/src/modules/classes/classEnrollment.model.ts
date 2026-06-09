import mongoose, { Model, Schema } from "mongoose";
import { IClassEnrollment } from "./types";

const classEnrollmentSchema = new Schema<IClassEnrollment>(
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
    enrolledAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

classEnrollmentSchema.index({ classId: 1, memberId: 1 }, { unique: true });

const ClassEnrollment: Model<IClassEnrollment> =
  mongoose.model<IClassEnrollment>("ClassEnrollment", classEnrollmentSchema);

export default ClassEnrollment;
