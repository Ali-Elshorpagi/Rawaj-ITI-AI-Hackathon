import { Request, Response, NextFunction } from "express";
import { DashboardService } from "./dashboard.service";

export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  async owner(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.dashboardService.getOwnerDashboard();
      res.sendSuccess("Owner dashboard fetched", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async manager(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.dashboardService.getManagerDashboard();
      res.sendSuccess("Manager dashboard fetched", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async trainer(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.dashboardService.getTrainerDashboard(req.user.id);
      res.sendSuccess("Trainer dashboard fetched", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async member(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.dashboardService.getMemberDashboard(
        req.user.memberId
      );
      res.sendSuccess("Member dashboard fetched", result, 200);
    } catch (error) {
      next(error);
    }
  }
}
