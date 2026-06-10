import { Request, Response, NextFunction } from "express";
import { AttendanceService } from "./attendance.service";
import { ForbiddenError } from "../../shared/utils/custom-errors";

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

  async memberHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.attendanceService.getMemberHistory(
        req.params.memberId,
        req.pagination ?? { page: 1, limit: 20, skip: 0 }
      );
      res.sendSuccess("Member attendance fetched", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async daily(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.attendanceService.getDailyReport(
        req.query.date as string | undefined
      );
      res.sendSuccess("Daily report fetched", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async monthly(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.attendanceService.getMonthlyStats(
        req.query.year ? Number(req.query.year) : undefined,
        req.query.month ? Number(req.query.month) : undefined
      );
      res.sendSuccess("Monthly stats fetched", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async checkInQR(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.attendanceService.checkInByQR(
        req.body.qrData,
        req.user?.id
      );
      res.sendSuccess("Check-in recorded", result, 201);
    } catch (error) {
      next(error);
    }
  }

  async selfCheckIn(req: Request, res: Response, next: NextFunction) {
    try {
      const memberId = req.user?.memberId;
      if (!memberId) throw new ForbiddenError("noMemberProfile");
      const result = await this.attendanceService.checkIn(
        { memberId, method: "manual" },
        req.user?.id
      );
      res.sendSuccess("Check-in recorded", result, 201);
    } catch (error) {
      next(error);
    }
  }

  async staffCheckOut(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.attendanceService.staffCheckOut(req.params.id);
      res.sendSuccess("Checked out successfully", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async selfCheckOut(req: Request, res: Response, next: NextFunction) {
    try {
      const memberId = req.user?.memberId;
      if (!memberId) throw new ForbiddenError("noMemberProfile");
      const result = await this.attendanceService.selfCheckOut(memberId);
      res.sendSuccess("Checked out successfully", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async todayStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const memberId = req.user?.memberId;
      if (!memberId) { res.sendSuccess("No member profile", null, 200); return; }
      const result = await this.attendanceService.getTodayStatus(memberId);
      res.sendSuccess("Today status fetched", result, 200);
    } catch (error) {
      next(error);
    }
  }
}
