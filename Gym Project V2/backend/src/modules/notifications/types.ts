import mongoose, { Document } from "mongoose";

export interface INotification extends Document {
  target: "user" | "interest";
  user?: mongoose.Types.ObjectId;
  app: "customer" | "provider" | "both";
  title_ar: string;
  message_ar: string;
  title_en: string;
  message_en: string;
  type: string;
  isRead: boolean;
  data?: Record<string, any>;
  action: string;
  createdAt: Date;
}
