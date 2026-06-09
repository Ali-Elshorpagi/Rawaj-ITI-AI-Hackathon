import mongoose, { Document } from "mongoose";

export type CheckInMethod = "qr" | "manual";

export interface IAttendance extends Document {
  memberId: mongoose.Types.ObjectId;
  checkedInAt: Date;
  method: CheckInMethod;
  staffId?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
