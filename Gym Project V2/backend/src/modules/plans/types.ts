import { Document } from "mongoose";

export interface ISubscriptionPlan extends Document {
  name: string;
  durationMonths: number;
  durationDays?: number;
  price: number;
  currency?: string;
  description?: string;
  color?: string;
  features?: string[];
  isPopular?: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
