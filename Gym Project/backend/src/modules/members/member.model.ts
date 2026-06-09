import mongoose, { Model, Schema } from "mongoose";
import { IMember } from "./types";

const memberSchema = new Schema<IMember>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    photo: { type: String, default: null },
    membershipStatus: {
      type: String,
      enum: ["active", "expired", "suspended"],
      default: "active",
    },
    subscriptionPlanId: {
      type: Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      default: null,
    },
    qrCode: { type: String, required: true, unique: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Member: Model<IMember> = mongoose.model<IMember>("Member", memberSchema);
export default Member;
