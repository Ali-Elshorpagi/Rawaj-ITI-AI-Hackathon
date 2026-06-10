import { Router } from "express";
import { GymPaymentController } from "./payment.controller";
import { GymPaymentService } from "./payment.service";
import { GymAuthMiddleware, requireRole } from "../../shared/middlewares/auth";
import paginationMiddleware from "../../shared/middlewares/pagination";

const STAFF = requireRole(["reception", "manager", "owner"]);
const MEMBER = requireRole(["member"]);

export class GymPaymentRouter {
  private paymentController: GymPaymentController;
  private gymAuth = new GymAuthMiddleware();

  constructor(paymentService: GymPaymentService) {
    this.paymentController = new GymPaymentController(paymentService);
  }

  createRouter() {
    const router = Router();
    const auth = this.gymAuth.authenticate.bind(this.gymAuth);

    // Stripe webhook — no auth (Stripe calls this directly)
    router.post("/webhook", this.paymentController.stripeWebhook.bind(this.paymentController));

    // Member: create Stripe checkout session
    router.post("/checkout", auth, MEMBER, this.paymentController.checkout.bind(this.paymentController));

    // Member: verify Stripe session and fulfill subscription
    router.post("/verify-session", auth, MEMBER, this.paymentController.verifySession.bind(this.paymentController));

    router.get(
      "/overdue",
      auth,
      STAFF,
      this.paymentController.overdue.bind(this.paymentController)
    );
    router.get(
      "/revenue/stats",
      auth,
      STAFF,
      this.paymentController.revenueStats.bind(this.paymentController)
    );
    router.get(
      "/member/:memberId",
      auth,
      STAFF,
      paginationMiddleware,
      this.paymentController.memberPayments.bind(this.paymentController)
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
