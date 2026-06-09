import { Router } from "express";
import { NotificationService } from "./notification.service";
import { NotificationController } from "./notification.controller";
import { GymAuthMiddleware } from "../../shared/middlewares/auth";

export class NotificationRouter {
  private notificationController: NotificationController;
  private gymAuthMiddleware = new GymAuthMiddleware();

  constructor(private notificationService: NotificationService) {
    this.notificationController = new NotificationController(
      this.notificationService
    );
  }

  createRouter() {
    const router = Router();
    const auth = this.gymAuthMiddleware.authenticate.bind(this.gymAuthMiddleware);

    router.get("/", auth, this.notificationController.listUnread.bind(this.notificationController));
    router.put("/:id/read", auth, this.notificationController.markRead.bind(this.notificationController));

    return router;
  }
}
