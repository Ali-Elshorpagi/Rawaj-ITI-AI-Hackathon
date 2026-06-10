import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { GymAuthMiddleware, requireRole } from "../../shared/middlewares/auth";

export class DashboardRouter {
  private dashboardController: DashboardController;
  private gymAuth = new GymAuthMiddleware();

  constructor(dashboardService: DashboardService) {
    this.dashboardController = new DashboardController(dashboardService);
  }

  createRouter() {
    const router = Router();
    const auth = this.gymAuth.authenticate.bind(this.gymAuth);

    router.get("/owner", auth, requireRole(["owner"]), this.dashboardController.owner.bind(this.dashboardController));
    router.get("/manager", auth, requireRole(["manager", "owner"]), this.dashboardController.manager.bind(this.dashboardController));
    router.get("/reception", auth, requireRole(["reception", "manager", "owner"]), this.dashboardController.reception.bind(this.dashboardController));
    router.get("/trainer", auth, requireRole(["trainer", "manager", "owner"]), this.dashboardController.trainer.bind(this.dashboardController));
    router.get("/member", auth, requireRole(["member", "reception", "manager", "owner"]), this.dashboardController.member.bind(this.dashboardController));

    return router;
  }
}
