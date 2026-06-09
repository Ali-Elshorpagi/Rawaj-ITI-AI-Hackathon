import { Router } from "express";
import { SubscriptionController } from "./subscription.controller";
import { SubscriptionService } from "./subscription.service";
import { GymAuthMiddleware, requireRole } from "../../shared/middlewares/auth";

const STAFF = requireRole(["reception", "manager", "owner"]);

export class SubscriptionRouter {
  private subscriptionController: SubscriptionController;
  private gymAuth = new GymAuthMiddleware();

  constructor(subscriptionService: SubscriptionService) {
    this.subscriptionController = new SubscriptionController(subscriptionService);
  }

  createRouter() {
    const router = Router();
    const auth = this.gymAuth.authenticate.bind(this.gymAuth);

    router.get(
      "/expiring",
      auth,
      STAFF,
      this.subscriptionController.expiring.bind(this.subscriptionController)
    );
    router.post("/", auth, STAFF, this.subscriptionController.create.bind(this.subscriptionController));
    router.put("/:id/renew", auth, STAFF, this.subscriptionController.renew.bind(this.subscriptionController));

    return router;
  }
}
