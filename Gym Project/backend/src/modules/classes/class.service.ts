import { z } from "zod";
import FitnessClass from "./fitnessClass.model";
import ClassEnrollment from "./classEnrollment.model";
import ClassAttendance from "./classAttendance.model";
import Trainer from "../trainers/trainer.model";
import Member from "../members/member.model";
import { mongoIdSchema } from "../../shared/utils/custom-checckers";
import { ConflictError, NotFoundError } from "../../shared/utils/custom-errors";
import {
  deletePhotoByUrl,
  extractPhotoUrl,
  markUploadedPhoto,
} from "../../shared/utils/gym/photo.utils";

const scheduleItem = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
});

const parseSchedule = (val: unknown) => {
  if (typeof val === "string") return JSON.parse(val);
  return val;
};

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  trainerId: mongoIdSchema,
  schedule: z.preprocess(parseSchedule, z.array(scheduleItem).default([])),
  capacity: z.coerce.number().int().min(1),
  location: z.string().min(1),
  coverImage: z.array(z.any()).optional(),
});

const updateSchema = createSchema.partial();

const enrollSchema = z.object({ memberId: mongoIdSchema });

const attendanceSchema = z.object({
  sessionDate: z.coerce.date(),
  records: z.array(
    z.object({
      memberId: mongoIdSchema,
      present: z.boolean(),
    })
  ),
});

export class ClassService {
  /**
   * List all active fitness classes (public).
   */
  async listClasses() {
    return FitnessClass.find({ isDeleted: false })
      .populate("trainerId")
      .sort({ name: 1 });
  }

  /**
   * Create a fitness class with optional cover image.
   */
  async createClass(data: unknown, language = "en") {
    const parsed = createSchema.parse(data);
    const trainer = await Trainer.findOne({
      _id: parsed.trainerId,
      isDeleted: false,
    });
    if (!trainer) throw new NotFoundError("trainerNotFound");

    const coverUrl = extractPhotoUrl(parsed.coverImage);
    await markUploadedPhoto(parsed.coverImage);

    return FitnessClass.create({
      name: parsed.name,
      description: parsed.description,
      trainerId: parsed.trainerId,
      schedule: parsed.schedule,
      capacity: parsed.capacity,
      location: parsed.location,
      coverImage: coverUrl,
    });
  }

  /**
   * Update class and optionally replace cover image.
   */
  async updateClass(id: string, data: unknown, language = "en") {
    const parsedId = mongoIdSchema.parse(id);
    const parsed = updateSchema.parse(data);
    const fitnessClass = await FitnessClass.findOne({
      _id: parsedId,
      isDeleted: false,
    });
    if (!fitnessClass) throw new NotFoundError("classNotFound");

    const coverUrl = extractPhotoUrl(parsed.coverImage);
    if (coverUrl) {
      await deletePhotoByUrl(fitnessClass.coverImage, language);
      fitnessClass.coverImage = coverUrl;
      await markUploadedPhoto(parsed.coverImage);
    }

    Object.assign(fitnessClass, {
      ...(parsed.name && { name: parsed.name }),
      ...(parsed.description !== undefined && { description: parsed.description }),
      ...(parsed.trainerId && { trainerId: parsed.trainerId }),
      ...(parsed.schedule && { schedule: parsed.schedule }),
      ...(parsed.capacity && { capacity: parsed.capacity }),
      ...(parsed.location && { location: parsed.location }),
    });
    await fitnessClass.save();
    return fitnessClass;
  }

  /**
   * Soft-delete a fitness class.
   */
  async deleteClass(id: string, language = "en") {
    const parsedId = mongoIdSchema.parse(id);
    const fitnessClass = await FitnessClass.findOne({
      _id: parsedId,
      isDeleted: false,
    });
    if (!fitnessClass) throw new NotFoundError("classNotFound");
    await deletePhotoByUrl(fitnessClass.coverImage, language);
    fitnessClass.isDeleted = true;
    await fitnessClass.save();
    return fitnessClass;
  }

  /**
   * Enroll a member in a class.
   */
  async enroll(classId: string, data: unknown) {
    const parsedClassId = mongoIdSchema.parse(classId);
    const { memberId } = enrollSchema.parse(data);

    const [fitnessClass, member, count] = await Promise.all([
      FitnessClass.findOne({ _id: parsedClassId, isDeleted: false }),
      Member.findOne({ _id: memberId, isDeleted: false }),
      ClassEnrollment.countDocuments({ classId: parsedClassId }),
    ]);
    if (!fitnessClass) throw new NotFoundError("classNotFound");
    if (!member) throw new NotFoundError("memberNotFound");
    if (count >= fitnessClass.capacity) {
      throw new ConflictError("classFull");
    }

    return ClassEnrollment.create({
      classId: parsedClassId,
      memberId,
      enrolledAt: new Date(),
    });
  }

  /**
   * List enrolled participants for a class.
   */
  async getParticipants(classId: string) {
    const parsedClassId = mongoIdSchema.parse(classId);
    return ClassEnrollment.find({ classId: parsedClassId })
      .populate("memberId")
      .sort({ enrolledAt: -1 });
  }

  /**
   * Mark session attendance for class participants.
   */
  async markAttendance(
    classId: string,
    trainerId: string,
    data: unknown
  ) {
    const parsedClassId = mongoIdSchema.parse(classId);
    const parsedTrainerId = mongoIdSchema.parse(trainerId);
    const parsed = attendanceSchema.parse(data);

    const fitnessClass = await FitnessClass.findOne({
      _id: parsedClassId,
      isDeleted: false,
    });
    if (!fitnessClass) throw new NotFoundError("classNotFound");

    const results = [];
    for (const record of parsed.records) {
      const doc = await ClassAttendance.findOneAndUpdate(
        {
          classId: parsedClassId,
          memberId: record.memberId,
          sessionDate: parsed.sessionDate,
        },
        {
          present: record.present,
          markedByTrainerId: parsedTrainerId,
        },
        { upsert: true, new: true }
      );
      results.push(doc);
    }
    return results;
  }
}
