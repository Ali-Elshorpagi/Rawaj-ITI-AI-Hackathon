import mongoose, { Model, Schema } from "mongoose";
import { ISubscriptionPlan } from "./types";

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: { type: String, required: true },
    durationMonths: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const SubscriptionPlan: Model<ISubscriptionPlan> =
  mongoose.model<ISubscriptionPlan>("SubscriptionPlan", subscriptionPlanSchema);

export default SubscriptionPlan;
