import { Router } from "express";
import { MemberController } from "./member.controller";
import { MemberService } from "./member.service";
import {
  GymAuthMiddleware,
  requireRole,
} from "../../shared/middlewares/auth";
import paginationMiddleware from "../../shared/middlewares/pagination";
import { optionalImageUpload } from "../../shared/middlewares/upload";

const STAFF = requireRole(["reception", "manager", "owner"]);

export class MemberRouter {
  private memberController: MemberController;
  private gymAuth = new GymAuthMiddleware();

  constructor(memberService: MemberService) {
    this.memberController = new MemberController(memberService);
  }

  createRouter() {
    const router = Router();
    const auth = this.gymAuth.authenticate.bind(this.gymAuth);

    router.get(
      "/",
      auth,
      STAFF,
      paginationMiddleware,
      this.memberController.list.bind(this.memberController)
    );

    router.get(
      "/stats",
      auth,
      STAFF,
      this.memberController.getStats.bind(this.memberController)
    );

    router.get(
      "/qr/:memberId",
      auth,
      STAFF,
      this.memberController.getByQR.bind(this.memberController)
    );

    router.post(
      "/",
      auth,
      STAFF,
      optionalImageUpload(["photo"]),
      this.memberController.create.bind(this.memberController)
    );

    router.get(
      "/:id",
      auth,
      STAFF,
      this.memberController.get.bind(this.memberController)
    );

    router.put(
      "/:id",
      auth,
      STAFF,
      optionalImageUpload(["photo"]),
      this.memberController.update.bind(this.memberController)
    );

    router.patch(
      "/:id/status",
      auth,
      STAFF,
      this.memberController.updateStatus.bind(this.memberController)
    );

    router.delete(
      "/:id",
      auth,
      STAFF,
      this.memberController.delete.bind(this.memberController)
    );

    router.get(
      "/:id/attendance",
      auth,
      STAFF,
      paginationMiddleware,
      this.memberController.getAttendance.bind(this.memberController)
    );

    router.get(
      "/:id/subscription",
      auth,
      STAFF,
      this.memberController.getSubscription.bind(this.memberController)
    );

    return router;
  }
}
