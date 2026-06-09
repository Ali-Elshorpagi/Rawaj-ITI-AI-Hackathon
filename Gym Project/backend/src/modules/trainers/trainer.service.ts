import { z } from "zod";
import Trainer from "./trainer.model";
import FitnessClass from "../classes/fitnessClass.model";
import User from "../users/user.model";
import { mongoIdSchema } from "../../shared/utils/custom-checckers";
import { NotFoundError } from "../../shared/utils/custom-errors";
import {
  deletePhotoByUrl,
  extractPhotoUrl,
  markUploadedPhoto,
} from "../../shared/utils/gym/photo.utils";

const createSchema = z.object({
  userId: mongoIdSchema,
  specialization: z.string().min(1),
  bio: z.string().optional(),
  photo: z.array(z.any()).optional(),
});

const updateSchema = z.object({
  specialization: z.string().min(1).optional(),
  bio: z.string().optional(),
  photo: z.array(z.any()).optional(),
});

export class TrainerService {
  /**
   * List all active trainers.
   */
  async listTrainers() {
    return Trainer.find({ isDeleted: false })
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });
  }

  /**
   * Create trainer profile with optional photo.
   */
  async createTrainer(data: unknown, language = "en") {
    const parsed = createSchema.parse(data);
    const user = await User.findById(parsed.userId);
    if (!user) throw new NotFoundError("userNotRegistered");

    const photoUrl = extractPhotoUrl(parsed.photo);
    await markUploadedPhoto(parsed.photo);

    return Trainer.create({
      userId: parsed.userId,
      specialization: parsed.specialization,
      bio: parsed.bio,
      photo: photoUrl,
    });
  }

  /**
   * Update trainer and optionally replace photo.
   */
  async updateTrainer(id: string, data: unknown, language = "en") {
    const parsedId = mongoIdSchema.parse(id);
    const parsed = updateSchema.parse(data);
    const trainer = await Trainer.findOne({ _id: parsedId, isDeleted: false });
    if (!trainer) throw new NotFoundError("trainerNotFound");

    const photoUrl = extractPhotoUrl(parsed.photo);
    if (photoUrl) {
      await deletePhotoByUrl(trainer.photo, language);
      trainer.photo = photoUrl;
      await markUploadedPhoto(parsed.photo);
    }
    if (parsed.specialization) trainer.specialization = parsed.specialization;
    if (parsed.bio !== undefined) trainer.bio = parsed.bio;
    await trainer.save();
    return trainer;
  }

  /**
   * Soft-delete trainer and remove Cloudinary photo.
   */
  async deleteTrainer(id: string, language = "en") {
    const parsedId = mongoIdSchema.parse(id);
    const trainer = await Trainer.findOne({ _id: parsedId, isDeleted: false });
    if (!trainer) throw new NotFoundError("trainerNotFound");
    await deletePhotoByUrl(trainer.photo, language);
    trainer.isDeleted = true;
    await trainer.save();
    return trainer;
  }

  /**
   * Get trainer weekly class schedule.
   */
  async getSchedule(id: string) {
    const parsedId = mongoIdSchema.parse(id);
    const trainer = await Trainer.findOne({ _id: parsedId, isDeleted: false });
    if (!trainer) throw new NotFoundError("trainerNotFound");

    const classes = await FitnessClass.find({
      trainerId: parsedId,
      isDeleted: false,
    });

    return { trainer, classes };
  }
}
