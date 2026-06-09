import mongoose, { Model, Schema } from "mongoose";
import { IAttendance } from "./types";

const attendanceSchema = new Schema<IAttendance>(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    checkedInAt: { type: Date, default: Date.now },
    method: {
      type: String,
      enum: ["qr", "manual"],
      required: true,
    },
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const Attendance: Model<IAttendance> = mongoose.model<IAttendance>(
  "Attendance",
  attendanceSchema
);

export default Attendance;
