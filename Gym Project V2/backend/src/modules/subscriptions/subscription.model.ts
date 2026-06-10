import mongoose, { Model, Schema } from "mongoose";
import { ISubscription } from "./types";

const subscriptionSchema = new Schema<ISubscription>(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "GymPayment",
      default: null,
    },
  },
  { timestamps: true }
);

const Subscription: Model<ISubscription> = mongoose.model<ISubscription>(
  "Subscription",
  subscriptionSchema
);

export default Subscription;
