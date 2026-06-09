import { Request, Response, NextFunction } from "express";
import { ClassService } from "./class.service";
import Trainer from "../trainers/trainer.model";

export class ClassController {
  constructor(private classService: ClassService) {}

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.classService.listClasses();
      res.sendSuccess("Classes fetched", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.classService.createClass(req.body, req.language);
      res.sendSuccess("Class created", result, 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.classService.updateClass(
        req.params.id,
        req.body,
        req.language
      );
      res.sendSuccess("Class updated", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.classService.deleteClass(
        req.params.id,
        req.language
      );
      res.sendSuccess("Class deleted", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async enroll(req: Request, res: Response, next: NextFunction) {
    try {
      const body =
        req.user.role === "member" && req.user.memberId
          ? { memberId: req.user.memberId }
          : req.body;
      const result = await this.classService.enroll(req.params.id, body);
      res.sendSuccess("Enrolled successfully", result, 201);
    } catch (error) {
      next(error);
    }
  }

  async participants(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.classService.getParticipants(req.params.id);
      res.sendSuccess("Participants fetched", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async attendance(req: Request, res: Response, next: NextFunction) {
    try {
      const trainer = await Trainer.findOne({
        userId: req.user.id,
        isDeleted: false,
      });
      if (!trainer) {
        res.sendSuccess("Attendance marked", [], 200);
        return;
      }
      const result = await this.classService.markAttendance(
        req.params.id,
        String(trainer._id),
        req.body
      );
      res.sendSuccess("Attendance marked", result, 200);
    } catch (error) {
      next(error);
    }
  }
}
