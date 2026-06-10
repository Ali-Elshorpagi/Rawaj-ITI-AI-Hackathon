import Agenda from "agenda";
import GymPayment from "../../gym-payments/gymPayment.model";
import Notification from "../notification.model";
import User from "../../users/user.model";

export const OVERDUE_PAYMENTS_JOB = "gym_overdue_payments";

export default (agenda: Agenda) => {
  agenda.define(OVERDUE_PAYMENTS_JOB, async () => {
    const now = new Date();
    const overdue = await GymPayment.find({
      status: { $in: ["pending", "overdue"] },
      dueDate: { $lt: now },
    });

    for (const payment of overdue) {
      if (payment.status !== "overdue") {
        payment.status = "overdue";
        await payment.save();
      }
    }

    const receptionUsers = await User.find({ roles: "reception" });
    for (const staff of receptionUsers) {
      await Notification.create({
        target: "user",
        app: "customer",
        user: staff._id,
        title_en: "Overdue payments alert",
        message_en: `${overdue.length} payment(s) are overdue and require attention.`,
        title_ar: "تنبيه مدفوعات متأخرة",
        message_ar: `${overdue.length} مدفوعة متأخرة تحتاج متابعة.`,
        type: "overdue-payment",
        isRead: false,
        action: "view-payments",
        data: { count: overdue.length },
      });
    }
  });
};
