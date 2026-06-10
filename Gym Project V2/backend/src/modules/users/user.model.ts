import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "./types";
// Define the TypeScript interface for the user document

// Create the Mongoose schema
const userSchema: Schema<IUser> = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    nationalID: { type: String },
    IBAN: { type: String }, // For installment purchases
    salaryProof: { type: mongoose.Schema.Types.ObjectId }, // File path
    accountStatement: { type: mongoose.Schema.Types.ObjectId }, // File path
    isVerified: { type: Boolean, default: false },
    photo: { type: mongoose.Schema.Types.ObjectId, default: null },
    otp: {
      code: { type: String },
      expiry: { type: Date },
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      default: null,
    },
    roles: {
      type: [
        {
          type: String,
          enum: ["member", "reception", "trainer", "manager", "owner"],
        },
      ],
      default: ["member"],
    },
  },
  { timestamps: true }
);

// Export the model
const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;
