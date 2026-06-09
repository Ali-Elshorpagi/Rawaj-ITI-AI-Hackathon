import { Router } from "express";
import { GymPaymentController } from "./payment.controller";
import { GymPaymentService } from "./payment.service";
import { GymAuthMiddleware, requireRole } from "../../shared/middlewares/auth";
import paginationMiddleware from "../../shared/middlewares/pagination";

const STAFF = requireRole(["reception", "manager", "owner"]);

export class GymPaymentRouter {
  private paymentController: GymPaymentController;
  private gymAuth = new GymAuthMiddleware();

  constructor(paymentService: GymPaymentService) {
    this.paymentController = new GymPaymentController(paymentService);
  }

  createRouter() {
    const router = Router();
    const auth = this.gymAuth.authenticate.bind(this.gymAuth);

    router.get(
      "/overdue",
      auth,
      STAFF,
      this.paymentController.overdue.bind(this.paymentController)
    );
    router.get(
      "/",
      auth,
      STAFF,
      paginationMiddleware,
      this.paymentController.list.bind(this.paymentController)
    );
    router.post("/", auth, STAFF, this.paymentController.create.bind(this.paymentController));
    router.put("/:id", auth, STAFF, this.paymentController.update.bind(this.paymentController));

    return router;
  }
}
