import Member from "../members/member.model";
import Trainer from "../trainers/trainer.model";
import FitnessClass from "../classes/fitnessClass.model";
import ClassEnrollment from "../classes/classEnrollment.model";
import ClassAttendance from "../classes/classAttendance.model";
import Attendance from "../attendance/attendance.model";
import GymPayment from "../gym-payments/gymPayment.model";
import Subscription from "../subscriptions/subscription.model";
import User from "../users/user.model";

export class DashboardService {
  async getOwnerDashboard() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      totalMembers,
      activeMembers,
      expiredMembers,
      suspendedMembers,
      todayAttendance,
      monthlyRevenue,
      lastMonthRevenue,
      newMembersThisMonth,
      expiringMembers,
      trainerCount,
      classCount,
      overduePayments,
      recentMembers,
      revenueByMonth,
      weeklyAttendance,
      planDistribution,
    ] = await Promise.all([
      Member.countDocuments({ isDeleted: false }),
      Member.countDocuments({ isDeleted: false, membershipStatus: "active" }),
      Member.countDocuments({ isDeleted: false, membershipStatus: "expired" }),
      Member.countDocuments({ isDeleted: false, membershipStatus: "suspended" }),
      Attendance.countDocuments({ checkedInAt: { $gte: today, $lte: todayEnd } }),
      GymPayment.aggregate([
        { $match: { status: "paid", paidAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]).then((r) => r[0]?.total ?? 0),
      GymPayment.aggregate([
        { $match: { status: "paid", paidAt: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]).then((r) => r[0]?.total ?? 0),
      Member.countDocuments({ isDeleted: false, createdAt: { $gte: monthStart } }),
      Subscription.countDocuments({
        status: "active",
        endDate: { $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      }),
      Trainer.countDocuments({ isDeleted: false }),
      FitnessClass.countDocuments({ isDeleted: false }),
      GymPayment.countDocuments({ status: "overdue" }),
      Member.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(6),
      GymPayment.aggregate([
        { $match: { status: "paid", paidAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { year: { $year: "$paidAt" }, month: { $month: "$paidAt" } }, revenue: { $sum: "$amount" } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      Attendance.aggregate([
        { $match: { checkedInAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dayOfMonth: "$checkedInAt" }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Subscription.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: "$planId", count: { $sum: 1 } } },
        { $lookup: { from: "subscriptionplans", localField: "_id", foreignField: "_id", as: "plan" } },
        { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } },
        { $project: { name: { $ifNull: ["$plan.name", "Unknown"] }, count: 1, _id: 0 } },
      ]),
    ]);

    const revenueGrowth = lastMonthRevenue > 0
      ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0;

    return {
      kpis: {
        totalMembers,
        activeMembers,
        expiredMembers,
        suspendedMembers,
        todayAttendance,
        monthlyRevenue,
        newMembersThisMonth,
        expiringMembers,
        trainerCount,
        classCount,
        overduePayments,
        revenueGrowth,
      },
      recentMembers,
      charts: {
        revenueByMonth: revenueByMonth.map((r: any) => ({ month: r._id.month, year: r._id.year, revenue: r.revenue })),
        weeklyAttendance: weeklyAttendance.map((r: any) => ({ day: r._id, count: r.count })),
        planDistribution,
      },
    };
  }

  async getManagerDashboard() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalMembers,
      activeMembers,
      todayAttendance,
      monthlyRevenue,
      lastMonthRevenue,
      overduePayments,
      pendingPayments,
      newMembersThisMonth,
      expiringMembers,
      recentAttendance,
      recentMembers,
      staffUsers,
      trainersWithClasses,
      dailyAttendance,
    ] = await Promise.all([
      Member.countDocuments({ isDeleted: false }),
      Member.countDocuments({ isDeleted: false, membershipStatus: "active" }),
      Attendance.countDocuments({ checkedInAt: { $gte: today, $lte: todayEnd } }),
      GymPayment.aggregate([
        { $match: { status: "paid", paidAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]).then((r) => r[0]?.total ?? 0),
      GymPayment.aggregate([
        { $match: { status: "paid", paidAt: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]).then((r) => r[0]?.total ?? 0),
      GymPayment.countDocuments({ status: "overdue" }),
      GymPayment.countDocuments({ status: "pending" }),
      Member.countDocuments({ isDeleted: false, createdAt: { $gte: monthStart } }),
      Subscription.countDocuments({
        status: "active",
        endDate: { $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      }),
      Attendance.find({ checkedInAt: { $gte: today, $lte: todayEnd } }).populate("memberId").sort({ checkedInAt: -1 }).limit(10),
      Member.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(5),
      User.find({ roles: { $in: ["trainer", "reception", "manager"] }, isVerified: true })
        .select("name email roles createdAt")
        .sort({ createdAt: -1 }),
      Trainer.find({ isDeleted: false })
        .populate("userId", "name email")
        .lean()
        .then(async (trainers) => {
          return Promise.all(
            trainers.map(async (t: any) => {
              const classCount = await FitnessClass.countDocuments({ trainerId: t._id, isDeleted: false });
              return { ...t, classCount };
            })
          );
        }),
      Attendance.aggregate([
        { $match: { checkedInAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$checkedInAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const revenueGrowth = lastMonthRevenue > 0
      ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0;

    return {
      kpis: {
        totalMembers,
        activeMembers,
        todayAttendance,
        monthlyRevenue,
        overduePayments,
        pendingPayments,
        newMembersThisMonth,
        expiringMembers,
        revenueGrowth,
      },
      recentAttendance,
      recentMembers,
      staffUsers,
      trainersWithClasses,
      charts: {
        dailyAttendance: dailyAttendance.map((r: any) => ({ date: r._id, count: r.count })),
      },
    };
  }

  async getReceptionDashboard() {
    const now = new Date();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      activeMembers,
      expiredMembers,
      todayAttendance,
      monthlyRevenue,
      overduePayments,
      pendingPayments,
      recentAttendance,
      expiringSubscriptions,
      recentSubscriptions,
      recentPayments,
    ] = await Promise.all([
      Member.countDocuments({ isDeleted: false, membershipStatus: "active" }),
      Member.countDocuments({ isDeleted: false, membershipStatus: { $in: ["expired", "suspended"] } }),
      Attendance.countDocuments({ checkedInAt: { $gte: today, $lte: todayEnd } }),
      GymPayment.aggregate([
        { $match: { status: "paid", paidAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]).then((r) => r[0]?.total ?? 0),
      GymPayment.countDocuments({ status: "overdue" }),
      GymPayment.countDocuments({ status: "pending" }),
      Attendance.find({ checkedInAt: { $gte: today, $lte: todayEnd } })
        .populate("memberId")
        .sort({ checkedInAt: -1 })
        .limit(6),
      Subscription.find({ status: "active", endDate: { $gte: now, $lte: inSevenDays } })
        .populate("memberId")
        .populate("planId")
        .sort({ endDate: 1 })
        .limit(6),
      Subscription.find()
        .populate("memberId")
        .populate("planId")
        .sort({ createdAt: -1 })
        .limit(6),
      GymPayment.find()
        .populate("memberId")
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    return {
      kpis: {
        activeMembers,
        expiredMembers,
        todayAttendance,
        monthlyRevenue,
        overduePayments,
        pendingPayments,
      },
      recentAttendance,
      expiringSubscriptions,
      recentSubscriptions,
      recentPayments,
    };
  }

  async getTrainerDashboard(userId: string) {
    const trainer = await Trainer.findOne({ userId, isDeleted: false });
    if (!trainer) return {
      trainer: null,
      classes: [],
      todaySessions: [],
      enrollmentStats: [],
      recentActivity: [],
    };

    const now = new Date();
    const todayDow = now.getDay(); // 0=Sun,1=Mon,...6=Sat
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [classes, totalClassAttendance, thisMonthAttendance] = await Promise.all([
      FitnessClass.find({ trainerId: trainer._id, isDeleted: false }).lean(),
      ClassAttendance.countDocuments({ markedByTrainerId: trainer._id }),
      ClassAttendance.countDocuments({ markedByTrainerId: trainer._id, sessionDate: { $gte: monthStart } }),
    ]);

    // Add enrollment counts to each class
    const classesWithEnrollments = await Promise.all(
      classes.map(async (cls: any) => {
        const enrollmentCount = await ClassEnrollment.countDocuments({ classId: cls._id });
        const recentAttendance = await ClassAttendance.find({ classId: cls._id })
          .sort({ sessionDate: -1 })
          .limit(1)
          .lean();
        return { ...cls, enrollmentCount, lastSession: recentAttendance[0]?.sessionDate ?? null };
      })
    );

    const todaySessions = classesWithEnrollments.filter((cls: any) =>
      cls.schedule?.some((s: any) => s.dayOfWeek === todayDow)
    );

    return {
      trainer: {
        ...trainer.toObject(),
        totalClassAttendance,
        thisMonthAttendance,
      },
      classes: classesWithEnrollments,
      todaySessions,
    };
  }

  async getMemberDashboard(memberId?: string) {
    if (!memberId) return {
      member: null,
      subscription: null,
      recentAttendance: [],
      upcomingClasses: [],
      stats: { totalAttendance: 0, thisMonthAttendance: 0 },
      daysUntilExpiry: null,
      durationDays: null,
    };

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
