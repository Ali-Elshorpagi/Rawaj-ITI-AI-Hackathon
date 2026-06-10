import { Request, Response, NextFunction } from "express";
import { NotificationService } from "./notification.service";

export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  async listUnread(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const response = await this.notificationService.listAll(req.user.id, limit);
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

  async unreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.notificationService.getUnreadCount(req.user.id);
      res.sendSuccess("Unread count fetched", response, 200);
    } catch (error) {
      next(error);
    }
  }

  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      await this.notificationService.markAllRead(req.user.id);
      res.sendSuccess("All notifications marked as read", null, 200);
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      await this.notificationService.deleteNotification(req.params.id, req.user.id);
      res.sendSuccess("Notification deleted", null, 200);
    } catch (error) {
      next(error);
    }
  }
}
