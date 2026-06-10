import { CreateMemberLogic } from "./create";
import { ListMembersLogic } from "./list";
import { GetMemberLogic } from "./get";
import { UpdateMemberLogic } from "./update";
import { DeleteMemberLogic } from "./delete";
import { GetMemberAttendanceLogic } from "./get-attendance";
import { GetMemberSubscriptionLogic } from "./get-subscription";
import Member from "./member.model";
import { NotFoundError } from "../../shared/utils/custom-errors";

export class MemberService {
  private createLogic = new CreateMemberLogic();
  private listLogic = new ListMembersLogic();
  private getLogic = new GetMemberLogic();
  private updateLogic = new UpdateMemberLogic();
  private deleteLogic = new DeleteMemberLogic();
  private getAttendanceLogic = new GetMemberAttendanceLogic();
  private getSubscriptionLogic = new GetMemberSubscriptionLogic();

  /** @see CreateMemberLogic.create */
  createMember(data: unknown, language?: string) {
    return this.createLogic.create(data as any, language);
  }

  /** @see ListMembersLogic.list */
  listMembers(pagination: object, query: Record<string, unknown>) {
    return this.listLogic.list(pagination as any, query);
  }

  /** @see GetMemberLogic.get */
  getMember(id: string) {
    return this.getLogic.get(id);
  }

  /** @see UpdateMemberLogic.update */
  updateMember(id: string, data: unknown, language?: string) {
    return this.updateLogic.update({ id, data } as any, language);
  }

  /** @see DeleteMemberLogic.delete */
  deleteMember(id: string, language?: string) {
    return this.deleteLogic.delete(id, language);
  }

  /** @see GetMemberAttendanceLogic.getAttendance */
  getMemberAttendance(id: string, pagination: object) {
    return this.getAttendanceLogic.getAttendance(id, pagination as any);
  }

  /** @see GetMemberSubscriptionLogic.getSubscription */
  getMemberSubscription(id: string) {
    return this.getSubscriptionLogic.getSubscription(id);
  }

  async getMemberByQR(qrCode: string) {
    const member = await Member.findOne({ qrCode, isDeleted: false });
    if (!member) throw new NotFoundError("memberNotFound");
    return member;
  }

  async updateMemberStatus(id: string, status: string) {
    const allowed = ["active", "expired", "suspended"];
    if (!allowed.includes(status)) {
      throw new Error("Invalid status");
    }
    const member = await Member.findByIdAndUpdate(
      id,
      { membershipStatus: status },
      { new: true }
    );
    if (!member) throw new NotFoundError("memberNotFound");
    return member;
  }

  async getMemberStats() {
    const [total, active, expired, suspended] = await Promise.all([
      Member.countDocuments({ isDeleted: false }),
      Member.countDocuments({ isDeleted: false, membershipStatus: "active" }),
      Member.countDocuments({ isDeleted: false, membershipStatus: "expired" }),
      Member.countDocuments({ isDeleted: false, membershipStatus: "suspended" }),
    ]);
    return { total, active, expired, suspended };
  }
}
