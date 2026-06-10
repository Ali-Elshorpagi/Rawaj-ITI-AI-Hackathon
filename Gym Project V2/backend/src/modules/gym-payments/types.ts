import mongoose, { Document } from "mongoose";

export type PaymentMethod = "cash" | "card" | "bank_transfer" | "online";
export type PaymentStatus = "paid" | "pending" | "overdue";

export interface IGymPayment extends Document {
  memberId: mongoose.Types.ObjectId;
  subscriptionId?: mongoose.Types.ObjectId;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt?: Date;
  dueDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
