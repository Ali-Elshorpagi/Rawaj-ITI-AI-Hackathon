import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  photo?: mongoose.Schema.Types.ObjectId;
  roles: string[];
  memberId?: mongoose.Schema.Types.ObjectId;
  nationalID?: string;
  IBAN?: string; // For installment purchases
  salaryProof?: string; // File path
  accountStatement?: string; // File path
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  otp?: {
    code: string;
    expiry: Date;
  };
}

export type IUserResponseData = Omit<IUser, "password" | "__v"> &
  Partial<Pick<IUser, "password">> & { __v?: number };
