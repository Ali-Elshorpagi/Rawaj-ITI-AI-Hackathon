import { Router } from "express";
import { PlanController } from "./plan.controller";
import { PlanService } from "./plan.service";
import { GymAuthMiddleware, requireRole } from "../../shared/middlewares/auth";

const MANAGER_OWNER = requireRole(["manager", "owner"]);

export class PlanRouter {
  private planController: PlanController;
  private gymAuth = new GymAuthMiddleware();

  constructor(planService: PlanService) {
    this.planController = new PlanController(planService);
  }

  createRouter() {
    const router = Router();
    const auth = this.gymAuth.authenticate.bind(this.gymAuth);

    router.get("/", this.planController.list.bind(this.planController));
    router.post("/", auth, MANAGER_OWNER, this.planController.create.bind(this.planController));
    router.put("/:id", auth, MANAGER_OWNER, this.planController.update.bind(this.planController));
    router.delete("/:id", auth, MANAGER_OWNER, this.planController.delete.bind(this.planController));

    return router;
  }
}
