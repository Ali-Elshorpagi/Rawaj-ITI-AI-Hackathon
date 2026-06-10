import Attendance from "../attendance/attendance.model";
import GymPayment from "../gym-payments/gymPayment.model";
import Member from "../members/member.model";
import FitnessClass from "../classes/fitnessClass.model";
import ClassEnrollment from "../classes/classEnrollment.model";

export class ReportService {
  /**
   * Attendance report for a date range.
   */
  async attendanceReport(from?: string, to?: string) {
    const filter: Record<string, unknown> = {};
    if (from || to) {
      filter.checkedInAt = {};
      if (from) (filter.checkedInAt as any).$gte = new Date(from);
      if (to) (filter.checkedInAt as any).$lte = new Date(to);
    }

    const [total, byMethod] = await Promise.all([
      Attendance.countDocuments(filter),
      Attendance.aggregate([
        { $match: filter },
        { $group: { _id: "$method", count: { $sum: 1 } } },
      ]),
    ]);

    return { total, byMethod };
  }

  /**
   * Revenue report for paid payments in date range.
   */
  async revenueReport(from?: string, to?: string) {
    const filter: Record<string, unknown> = { status: "paid" };
    if (from || to) {
      filter.paidAt = {};
      if (from) (filter.paidAt as any).$gte = new Date(from);
      if (to) (filter.paidAt as any).$lte = new Date(to);
    }

    const result = await GymPayment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    return result[0] ?? { totalRevenue: 0, count: 0 };
  }

  /**
   * Member statistics report.
   */
  async membersReport() {
    const [total, byStatus] = await Promise.all([
      Member.countDocuments({ isDeleted: false }),
      Member.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$membershipStatus", count: { $sum: 1 } } },
      ]),
    ]);
    return { total, byStatus };
  }

  /**
   * Class enrollment statistics.
   */
  async classesReport() {
    const [totalClasses, enrollments] = await Promise.all([
      FitnessClass.countDocuments({ isDeleted: false }),
      ClassEnrollment.aggregate([
        {
          $group: {
            _id: "$classId",
            enrolled: { $sum: 1 },
          },
        },
        { $sort: { enrolled: -1 } },
      ]),
    ]);
    return { totalClasses, enrollments };
  }
}
