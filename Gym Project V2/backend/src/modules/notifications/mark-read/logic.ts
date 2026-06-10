import Notification from "../notification.model";
import { mongoIdSchema } from "../../../shared/utils/custom-checckers";
import { NotFoundError } from "../../../shared/utils/custom-errors";

export class MarkReadLogic {
  /**
   * Mark a notification as read for the owning user.
   * @param notificationId - Notification id
   * @param userId - Authenticated user id
   * @returns Updated notification
   * @throws NotFoundError when notification not found
   */
  async markRead(notificationId: string, userId: string) {
    const parsedNotifId = mongoIdSchema.parse(notificationId);
    const parsedUserId = mongoIdSchema.parse(userId);

    const notification = await Notification.findOneAndUpdate(
      { _id: parsedNotifId, user: parsedUserId },
      { isRead: true },
      { new: true }
    );
    if (!notification) throw new NotFoundError("notificationNotFound");
    return notification;
  }
}
