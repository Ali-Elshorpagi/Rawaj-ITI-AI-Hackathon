import mongoose, { Schema, Document } from "mongoose";

// Define the interface for the token schema
interface ITempToken extends Document {
  email: string;
  token: string;
  createdAt: Date;
}

// Create the Token schema
const TempTokenSchema: Schema = new Schema<ITempToken>({
  email: { type: String, required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 900 }, // TTL of 15 minutes (900 seconds)
});

// Create the Token model
const TempToken = mongoose.model<ITempToken>("TempToken", TempTokenSchema);

export default TempToken;
