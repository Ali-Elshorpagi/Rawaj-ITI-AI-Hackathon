import Member from "../member.model";
import { mongoIdSchema } from "../../../shared/utils/custom-checckers";
import { deletePhotoByUrl } from "../../../shared/utils/gym/photo.utils";
import { NotFoundError } from "../../../shared/utils/custom-errors";

export class DeleteMemberLogic {
  /**
   * Soft-delete a member and remove Cloudinary photo if present.
   * @param id - Member MongoDB id
   * @param language - i18n language code
   * @returns Soft-deleted member
   * @throws NotFoundError when member not found
   */
  async delete(id: string, language = "en") {
    const parsedId = mongoIdSchema.parse(id);
    const member = await Member.findOne({ _id: parsedId, isDeleted: false });
    if (!member) {
      throw new NotFoundError("memberNotFound");
    }

    await deletePhotoByUrl(member.photo, language);
    member.isDeleted = true;
    await member.save();
    return member;
  }
}
