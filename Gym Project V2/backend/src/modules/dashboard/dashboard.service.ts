import Member from "../members/member.model";
import Trainer from "../trainers/trainer.model";
import FitnessClass from "../classes/fitnessClass.model";
import Attendance from "../attendance/attendance.model";
import GymPayment from "../gym-payments/gymPayment.model";
import Subscription from "../subscriptions/subscription.model";

export class DashboardService {
  async getOwnerDashboard() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const [
      totalMembers,
      activeMembers,
      todayAttendance,
      monthlyRevenue,
      newMembersThisMonth,
      expiringMembers,
      trainerCount,
      classCount,
    ] = await Promise.all([
      Member.countDocuments({ isDeleted: false }),
      Member.countDocuments({ isDeleted: false, membershipStatus: "active" }),
      Attendance.countDocuments({ checkedInAt: { $gte: today, $lte: todayEnd } }),
      GymPayment.aggregate([
        { $match: { status: "paid", paidAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]).then((r) => r[0]?.total ?? 0),
      Member.countDocuments({ isDeleted: false, createdAt: { $gte: monthStart } }),
      Subscription.countDocuments({
        status: "active",
        endDate: { $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      }),
      Trainer.countDocuments({ isDeleted: false }),
      FitnessClass.countDocuments({ isDeleted: false }),
    ]);

    return {
      totalMembers,
      activeMembers,
      todayAttendance,
      monthlyRevenue,
      newMembersThisMonth,
      expiringMembers,
      trainerCount,
      classCount,
    };
  }

  async getManagerDashboard() {
    return this.getOwnerDashboard();
  }

  async getTrainerDashboard(userId: string) {
    const trainer = await Trainer.findOne({ userId, isDeleted: false });
    if (!trainer) return { classes: [], upcomingClasses: 0 };

    const classes = await FitnessClass.find({ trainerId: trainer._id, isDeleted: false });
    return { classes, upcomingClasses: classes.length };
  }

  async getMemberDashboard(memberId?: string) {
    if (!memberId) return { member: null, subscription: null, recentAttendance: [], upcomingClasses: [], stats: { totalAttendance: 0, thisMonthAttendance: 0 }, daysUntilExpiry: null, durationDays: null };

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [member, subscription, recentAttendance, upcomingClasses, totalAttendance, thisMonthAttendance] = await Promise.all([
      Member.findById(memberId),
      Subscription.findOne({ memberId, status: "active" }).populate("planId"),
      Attendance.find({ memberId }).sort({ checkedInAt: -1 }).limit(10),
      FitnessClass.find({ isDeleted: false }).limit(6),
      Attendance.countDocuments({ memberId }),
      Attendance.countDocuments({ memberId, checkedInAt: { $gte: monthStart } }),
    ]);

    const daysUntilExpiry = subscription
      ? Math.max(0, Math.ceil((new Date((subscription as any).endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : null;

    const durationDays = subscription
      ? Math.ceil((new Date((subscription as any).endDate).getTime() - new Date((subscription as any).startDate).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      member,
      subscription,
      daysUntilExpiry,
      durationDays,
      recentAttendance,
      upcomingClasses,
      stats: { totalAttendance, thisMonthAttendance },
    };
  }
}
