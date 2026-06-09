import { Request, Response, NextFunction } from "express";
import { TrainerService } from "./trainer.service";

export class TrainerController {
  constructor(private trainerService: TrainerService) {}

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.trainerService.listTrainers();
      res.sendSuccess("Trainers fetched", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.trainerService.createTrainer(req.body, req.language);
      res.sendSuccess("Trainer created", result, 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.trainerService.updateTrainer(
        req.params.id,
        req.body,
        req.language
      );
      res.sendSuccess("Trainer updated", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.trainerService.deleteTrainer(
        req.params.id,
        req.language
      );
      res.sendSuccess("Trainer deleted", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async schedule(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.trainerService.getSchedule(req.params.id);
      res.sendSuccess("Schedule fetched", result, 200);
    } catch (error) {
      next(error);
    }
  }
}
