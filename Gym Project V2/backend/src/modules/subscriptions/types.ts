import mongoose, { Document } from "mongoose";

export type SubscriptionStatus = "active" | "expired" | "cancelled";

export interface ISubscription extends Document {
  memberId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: SubscriptionStatus;
  paymentId?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
