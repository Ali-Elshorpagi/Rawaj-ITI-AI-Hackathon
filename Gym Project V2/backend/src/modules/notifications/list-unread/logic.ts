import Notification from "../notification.model";
import { mongoIdSchema } from "../../../shared/utils/custom-checckers";

export class ListUnreadLogic {
  /**
   * Get unread notifications for the current user.
   * @param userId - Authenticated user id
   * @returns Unread notification list
   */
  async listUnread(userId: string) {
    const parsedId = mongoIdSchema.parse(userId);
    return Notification.find({ user: parsedId, isRead: false }).sort({
      createdAt: -1,
    });
  }
}
