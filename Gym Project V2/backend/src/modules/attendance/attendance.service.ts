import { z } from "zod";
import Attendance from "./attendance.model";
import Member from "../members/member.model";
import { mongoIdSchema } from "../../shared/utils/custom-checckers";
import { ForbiddenError, NotFoundError } from "../../shared/utils/custom-errors";

const checkInSchema = z
  .object({
    memberId: mongoIdSchema.optional(),
    qrToken: z.string().optional(),
    method: z.enum(["qr", "manual"]).default("qr"),
  })
  .refine((d) => d.memberId || d.qrToken, {
    message: "memberId or qrToken required",
  });

export class AttendanceService {
  /**
   * Validate member and record check-in.
   */
  async checkIn(data: unknown, staffId?: string) {
    const parsed = checkInSchema.parse(data);
    let member;

    if (parsed.qrToken) {
      member = await Member.findOne({
        qrCode: parsed.qrToken,
        isDeleted: false,
      });
    } else {
      member = await Member.findOne({
        _id: parsed.memberId,
        isDeleted: false,
      });
    }

    if (!member) throw new NotFoundError("memberNotFound");

    if (member.membershipStatus !== "active") {
      throw new ForbiddenError("membershipNotActive");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const existingRecord = await Attendance.findOne({
      memberId: member._id,
      checkedInAt: { $gte: today, $lte: todayEnd },
    }).sort({ checkedInAt: -1 });

    if (existingRecord && !existingRecord.checkedOutAt) {
      throw new ForbiddenError("alreadyCheckedIn");
    }

    return Attendance.create({
      memberId: member._id,
      checkedInAt: new Date(),
      method: parsed.method,
      staffId: staffId ?? null,
      checkedOutAt: null,
    });
  }

  /**
   * List attendance with filters and pagination.
   */
  async listAttendance(
    pagination: { page: number; limit: number; skip: number },
    query: Record<string, unknown>
  ) {
    const filter: Record<string, unknown> = {};
    if (query.memberId) filter.memberId = query.memberId;
    if (query.method) filter.method = query.method;
    if (query.date) {
      const day = new Date(query.date as string);
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      filter.checkedInAt = { $gte: day, $lt: next };
    }

    const [items, total] = await Promise.all([
      Attendance.find(filter)
        .sort({ checkedInAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .populate("memberId"),
      Attendance.countDocuments(filter),
    ]);

    return {
      items,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  /**
   * Get today's check-ins.
   */
  async getToday() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return Attendance.find({
      checkedInAt: { $gte: start, $lte: end },
    })
      .populate("memberId")
      .sort({ checkedInAt: -1 });
  }

  /**
   * Get attendance history for a specific member (paginated).
   */
  async getMemberHistory(
    memberId: string,
    pagination: { page: number; limit: number; skip: number }
  ) {
    const [items, total] = await Promise.all([
      Attendance.find({ memberId })
        .sort({ checkedInAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      Attendance.countDocuments({ memberId }),
    ]);
    return {
      items,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  /**
   * Daily attendance report for a given date (defaults to today).
   */
  async getDailyReport(date?: string) {
    const day = date ? new Date(date) : new Date();
    day.setHours(0, 0, 0, 0);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);

    const records = await Attendance.find({
      checkedInAt: { $gte: day, $lt: next },
    })
      .populate("memberId")
      .sort({ checkedInAt: -1 });

    return { date: day, total: records.length, records };
  }

  /**
   * Monthly attendance stats grouped by day.
   */
  async getMonthlyStats(year?: number, month?: number) {
    const now = new Date();
    const y = year ?? now.getFullYear();
    const m = month !== undefined ? month - 1 : now.getMonth();
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 1);

    const byDay = await Attendance.aggregate([
      { $match: { checkedInAt: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: { $dayOfMonth: "$checkedInAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const total = byDay.reduce((sum: number, d: any) => sum + d.count, 0);
    return { year: y, month: m + 1, total, byDay };
  }

  /**
   * QR-based check-in (passes qrToken to the main checkIn logic).
   */
  async checkInByQR(qrData: string, staffId?: string) {
    return this.checkIn({ qrToken: qrData, method: "qr" }, staffId);
  }

  /**
   * Self check-out for member.
   */
  async selfCheckOut(memberId: string) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const record = await Attendance.findOne({
      memberId, checkedInAt: { $gte: today, $lte: todayEnd }, checkedOutAt: null
    }).sort({ checkedInAt: -1 });
    if (!record) throw new NotFoundError("notCheckedIn");
    record.checkedOutAt = new Date();
    await record.save();
    return record;
  }

  /**
   * Get today's check-in status for a member.
   */
  async getTodayStatus(memberId: string) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    return Attendance.findOne({
      memberId, checkedInAt: { $gte: today, $lte: todayEnd }
    }).sort({ checkedInAt: -1 });
  }

  /**
   * Auto check-out all members who have been checked in for more than 3 hours.
   */
  async autoCheckOutAll() {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    await Attendance.updateMany(
      { checkedOutAt: null, checkedInAt: { $lte: threeHoursAgo } },
      { checkedOutAt: threeHoursAgo }
    );
  }
}
