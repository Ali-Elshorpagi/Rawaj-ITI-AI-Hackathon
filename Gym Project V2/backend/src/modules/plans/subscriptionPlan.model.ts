import mongoose, { Model, Schema } from "mongoose";
import { ISubscriptionPlan } from "./types";

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: { type: String, required: true },
    durationMonths: { type: Number, required: true, min: 1 },
    durationDays: { type: Number },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    description: { type: String, default: "" },
    color: { type: String, default: "#0D9488" },
    features: [{ type: String }],
    isPopular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const SubscriptionPlan: Model<ISubscriptionPlan> =
  mongoose.model<ISubscriptionPlan>("SubscriptionPlan", subscriptionPlanSchema);

export default SubscriptionPlan;
