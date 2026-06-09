import { z } from "zod";
import Attendance from "./attendance.model";
import Member from "../members/member.model";
import Subscription from "../subscriptions/subscription.model";
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
   * Validate member subscription and record check-in.
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

    if (member.membershipStatus === "suspended") {
      throw new ForbiddenError("membershipSuspended");
    }
    if (member.membershipStatus === "expired") {
      throw new ForbiddenError("membershipExpired");
    }

    const activeSub = await Subscription.findOne({
      memberId: member._id,
      status: "active",
      endDate: { $gte: new Date() },
    });
    if (!activeSub) {
      throw new ForbiddenError("noActiveSubscription");
    }

    return Attendance.create({
      memberId: member._id,
      checkedInAt: new Date(),
      method: parsed.method,
      staffId: staffId ?? null,
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
}
