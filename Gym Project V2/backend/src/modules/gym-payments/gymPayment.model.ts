import mongoose, { Model, Schema } from "mongoose";
import { IGymPayment } from "./types";

const gymPaymentSchema = new Schema<IGymPayment>(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ["cash", "card", "bank_transfer", "online"],
      required: true,
    },
    status: {
      type: String,
      enum: ["paid", "pending", "overdue"],
      default: "pending",
    },
    paidAt: { type: Date, default: null },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const GymPayment: Model<IGymPayment> = mongoose.model<IGymPayment>(
  "GymPayment",
  gymPaymentSchema
);

export default GymPayment;
