import { Request, Response, NextFunction } from "express";
import { NotificationService } from "./notification.service";

export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  async listUnread(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.notificationService.listUnread(req.user.id);
      res.sendSuccess("Notifications fetched", response, 200);
    } catch (error) {
      next(error);
    }
  }

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.notificationService.markRead(
        req.params.id,
        req.user.id
      );
      res.sendSuccess("Notification marked as read", response, 200);
    } catch (error) {
      next(error);
    }
  }
}
