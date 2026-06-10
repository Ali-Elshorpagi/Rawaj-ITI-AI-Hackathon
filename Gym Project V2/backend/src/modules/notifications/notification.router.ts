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
    router.get("/unread-count", auth, this.notificationController.unreadCount.bind(this.notificationController));
    router.put("/:id/read", auth, this.notificationController.markRead.bind(this.notificationController));
    router.patch("/read-all", auth, this.notificationController.markAllRead.bind(this.notificationController));
    router.delete("/:id", auth, this.notificationController.deleteNotification.bind(this.notificationController));

    return router;
  }
}
