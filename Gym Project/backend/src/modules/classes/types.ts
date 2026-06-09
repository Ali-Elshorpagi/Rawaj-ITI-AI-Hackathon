import mongoose, { Document } from "mongoose";

export interface IClassSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface IFitnessClass extends Document {
  name: string;
  description?: string;
  trainerId: mongoose.Types.ObjectId;
  schedule: IClassSchedule[];
  capacity: number;
  location: string;
  coverImage?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IClassEnrollment extends Document {
  classId: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId;
  enrolledAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IClassAttendance extends Document {
  classId: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId;
  sessionDate: Date;
  present: boolean;
  markedByTrainerId: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
