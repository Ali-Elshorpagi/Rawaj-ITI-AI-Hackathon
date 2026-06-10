import Agenda from "agenda";
import Subscription from "../../subscriptions/subscription.model";
import Notification from "../notification.model";
import User from "../../users/user.model";

export const SUBSCRIPTION_EXPIRY_JOB = "gym_subscription_expiry";

export default (agenda: Agenda) => {
  agenda.define(SUBSCRIPTION_EXPIRY_JOB, async () => {
    const windows = [3, 7];

    for (const days of windows) {
      const now = new Date();
      const target = new Date();
      target.setDate(target.getDate() + days);
      const dayStart = new Date(target);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(target);
      dayEnd.setHours(23, 59, 59, 999);

      const expiring = await Subscription.find({
        status: "active",
        endDate: { $gte: dayStart, $lte: dayEnd },
      }).populate("memberId");

      for (const sub of expiring) {
        const member = sub.memberId as any;
        if (!member?.email) continue;

        const user = await User.findOne({ memberId: member._id });
        if (!user) continue;

        await Notification.create({
          target: "user",
          app: "customer",
          user: user._id,
          title_en: `Subscription expiring in ${days} days`,
          message_en: `Your gym membership expires on ${sub.endDate.toDateString()}.`,
          title_ar: `ينتهي الاشتراك خلال ${days} أيام`,
          message_ar: `ينتهي اشتراكك في الصالة في ${sub.endDate.toDateString()}.`,
          type: "subscription-expiry",
          isRead: false,
          action: "renew",
          data: { subscriptionId: sub._id, days },
        });
      }
    }
  });
};
