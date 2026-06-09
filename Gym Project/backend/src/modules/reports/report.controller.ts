import { Request, Response, NextFunction } from "express";
import { ReportService } from "./report.service";

export class ReportController {
  constructor(private reportService: ReportService) {}

  async attendance(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.reportService.attendanceReport(
        req.query.from as string,
        req.query.to as string
      );
      res.sendSuccess("Attendance report", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async revenue(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.reportService.revenueReport(
        req.query.from as string,
        req.query.to as string
      );
      res.sendSuccess("Revenue report", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async members(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.reportService.membersReport();
      res.sendSuccess("Members report", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async classes(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.reportService.classesReport();
      res.sendSuccess("Classes report", result, 200);
    } catch (error) {
      next(error);
    }
  }
}
