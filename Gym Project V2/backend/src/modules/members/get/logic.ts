import Member from "../member.model";
import { mongoIdSchema } from "../../../shared/utils/custom-checckers";
import { NotFoundError } from "../../../shared/utils/custom-errors";
export class GetMemberLogic {
  /**
   * Get a single member by id.
   * @param id - Member MongoDB id
   * @returns Member document
   * @throws NotFoundError when member not found
   */
  async get(id: string) {
    const parsedId = mongoIdSchema.parse(id);
    const member = await Member.findOne({ _id: parsedId, isDeleted: false });
    if (!member) {
      throw new NotFoundError("memberNotFound");
    }
    return member;
  }
}
