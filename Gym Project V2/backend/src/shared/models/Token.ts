import mongoose, { Document, Schema, Model } from "mongoose";

interface IToken extends Document {
  user: mongoose.Types.ObjectId; // Reference to User
  token: string; // JWT or any token string
  createdAt: Date;
  updatedAt: Date;
}

const tokenSchema: Schema<IToken> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Automatically manage createdAt field
  }
);

const Token: Model<IToken> = mongoose.model<IToken>("Token", tokenSchema);

export default Token;
