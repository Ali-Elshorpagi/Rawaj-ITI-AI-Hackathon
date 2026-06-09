import { Document } from "mongoose";

export interface ISubscriptionPlan extends Document {
  name: string;
  durationMonths: number;
  price: number;
  description?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
