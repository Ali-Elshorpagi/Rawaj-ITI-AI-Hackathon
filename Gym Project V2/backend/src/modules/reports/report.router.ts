import { Router } from "express";
import { ReportController } from "./report.controller";
import { ReportService } from "./report.service";
import { GymAuthMiddleware, requireRole } from "../../shared/middlewares/auth";

const MANAGER_OWNER = requireRole(["manager", "owner"]);

export class ReportRouter {
  private reportController: ReportController;
  private gymAuth = new GymAuthMiddleware();

  constructor(reportService: ReportService) {
    this.reportController = new ReportController(reportService);
  }

  createRouter() {
    const router = Router();
    const auth = this.gymAuth.authenticate.bind(this.gymAuth);

    router.get(
      "/attendance",
      auth,
      MANAGER_OWNER,
      this.reportController.attendance.bind(this.reportController)
    );
    router.get(
      "/revenue",
      auth,
      MANAGER_OWNER,
      this.reportController.revenue.bind(this.reportController)
    );
    router.get(
      "/members",
      auth,
      MANAGER_OWNER,
      this.reportController.members.bind(this.reportController)
    );
    router.get(
      "/classes",
      auth,
      MANAGER_OWNER,
      this.reportController.classes.bind(this.reportController)
    );

    return router;
  }
}
