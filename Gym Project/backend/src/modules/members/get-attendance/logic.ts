import Attendance from "../../attendance/attendance.model";
import { mongoIdSchema } from "../../../shared/utils/custom-checckers";
import { GetMemberLogic } from "../get/logic";

export class GetMemberAttendanceLogic {
  private getMemberLogic = new GetMemberLogic();

  /**
   * List attendance records for a member.
   * @param memberId - Member MongoDB id
   * @param pagination - page, limit, skip
   * @returns Paginated attendance history
   */
  async getAttendance(
    memberId: string,
    pagination: { page: number; limit: number; skip: number }
  ) {
    await this.getMemberLogic.get(memberId);
    const parsedId = mongoIdSchema.parse(memberId);

    const filter = { memberId: parsedId };
    const [items, total] = await Promise.all([
      Attendance.find(filter)
        .sort({ checkedInAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
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
}
