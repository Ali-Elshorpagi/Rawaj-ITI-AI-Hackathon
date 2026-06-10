import Member from "../member.model";
import { inputSchema, Input } from "./input";
import {
  deletePhotoByUrl,
  extractPhotoUrl,
  markUploadedPhoto,
} from "../../../shared/utils/gym/photo.utils";
import { NotFoundError } from "../../../shared/utils/custom-errors";

export class UpdateMemberLogic {
  /**
   * Update member fields and optionally replace Cloudinary photo.
   * @param input - Member id and update payload
   * @param language - i18n language code
   * @returns Updated member
   * @throws NotFoundError when member not found
   */
  async update(input: Input, language = "en") {
    const { id, data } = inputSchema.parse(input);
    const member = await Member.findOne({ _id: id, isDeleted: false });
    if (!member) {
      throw new NotFoundError("memberNotFound");
    }

    const photoUrl = extractPhotoUrl(data.photo);
    if (photoUrl) {
      await deletePhotoByUrl(member.photo, language);
      member.photo = photoUrl;
      await markUploadedPhoto(data.photo);
    }

    if (data.fullName) member.fullName = data.fullName;
    if (data.email) member.email = data.email;
    if (data.phone) member.phone = data.phone;
    if (data.membershipStatus) member.membershipStatus = data.membershipStatus;
    if (data.subscriptionPlanId) {
      member.subscriptionPlanId = data.subscriptionPlanId as any;
    }

    await member.save();
    return member;
  }
}
