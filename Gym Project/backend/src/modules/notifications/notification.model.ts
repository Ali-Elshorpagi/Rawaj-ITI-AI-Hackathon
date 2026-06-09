import mongoose, { Model, Schema } from "mongoose";
import { INotification } from "./types";

const noificationSchema: Schema = new mongoose.Schema<INotification>({
  target: {
    type: String,
    enum: ["user", "interest"],
  },
  app: {
    type: String,
    enum: ["customer", "provider", "both"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title_ar: {
    type: String,
    required: true,
  },
  message_ar: {
    type: String,
    required: true,
  },
  title_en: {
    type: String,
    required: true,
  },
  message_en: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["subscription-expiry", "overdue-payment", "general"],
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  action: {
    type: String,
    default: "none",
  },
  data: { type: Schema.Types.Mixed }, // Stores any additional data
});

const Notification: Model<INotification> = mongoose.model<INotification>(
  "Notification",
  noificationSchema
);

export default Notification;
