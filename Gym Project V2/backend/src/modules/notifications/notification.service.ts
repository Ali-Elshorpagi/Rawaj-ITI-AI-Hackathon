import { ListUnreadLogic } from "./list-unread/logic";
import { MarkReadLogic } from "./mark-read/logic";
import Notification from "./notification.model";
import { mongoIdSchema } from "../../shared/utils/custom-checckers";

export class NotificationService {
  private listUnreadLogic = new ListUnreadLogic();
  private markReadLogic = new MarkReadLogic();

  /** @see ListUnreadLogic.listUnread */
  listUnread(userId: string) {
    return this.listUnreadLogic.listUnread(userId);
  }

  async listAll(userId: string, limit = 20) {
    const parsedId = mongoIdSchema.parse(userId);
    return Notification.find({ user: parsedId })
      .sort({ _id: -1 })
      .limit(limit);
  }

  /** @see MarkReadLogic.markRead */
  markRead(notificationId: string, userId: string) {
    return this.markReadLogic.markRead(notificationId, userId);
  }

  async getUnreadCount(userId: string) {
    const parsedId = mongoIdSchema.parse(userId);
    const count = await Notification.countDocuments({ user: parsedId, isRead: false });
    return { count };
  }

  async markAllRead(userId: string) {
    const parsedId = mongoIdSchema.parse(userId);
    await Notification.updateMany({ user: parsedId, isRead: false }, { isRead: true });
  }

  async deleteNotification(id: string, userId: string) {
    const parsedId = mongoIdSchema.parse(id);
    const parsedUserId = mongoIdSchema.parse(userId);
    await Notification.findOneAndDelete({ _id: parsedId, user: parsedUserId });
  }
}
