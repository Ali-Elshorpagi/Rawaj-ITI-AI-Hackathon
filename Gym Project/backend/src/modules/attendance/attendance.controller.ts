import { Request, Response, NextFunction } from "express";
import { AttendanceService } from "./attendance.service";

export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.attendanceService.checkIn(
        req.body,
        req.user?.id
      );
      res.sendSuccess("Check-in recorded", result, 201);
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.attendanceService.listAttendance(
        req.pagination ?? { page: 1, limit: 10, skip: 0 },
        req.query ?? {}
      );
      res.sendSuccess("Attendance fetched", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async today(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.attendanceService.getToday();
      res.sendSuccess("Today's attendance fetched", result, 200);
    } catch (error) {
      next(error);
    }
  }
}
