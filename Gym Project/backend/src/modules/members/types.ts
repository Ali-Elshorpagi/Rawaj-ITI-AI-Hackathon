import mongoose, { Document } from "mongoose";

export type MembershipStatus = "active" | "expired" | "suspended";

export interface IMember extends Document {
  fullName: string;
  email: string;
  phone: string;
  photo?: string;
  membershipStatus: MembershipStatus;
  subscriptionPlanId?: mongoose.Types.ObjectId;
  qrCode: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
