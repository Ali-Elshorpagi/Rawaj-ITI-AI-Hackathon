import { ListUnreadLogic } from "./list-unread/logic";
import { MarkReadLogic } from "./mark-read/logic";

export class NotificationService {
  private listUnreadLogic = new ListUnreadLogic();
  private markReadLogic = new MarkReadLogic();

  /** @see ListUnreadLogic.listUnread */
  listUnread(userId: string) {
    return this.listUnreadLogic.listUnread(userId);
  }

  /** @see MarkReadLogic.markRead */
  markRead(notificationId: string, userId: string) {
    return this.markReadLogic.markRead(notificationId, userId);
  }
}
