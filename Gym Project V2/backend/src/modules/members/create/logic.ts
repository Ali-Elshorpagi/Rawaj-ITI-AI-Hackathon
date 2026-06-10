import Member from "../member.model";
import { inputSchema, Input } from "./input";
import { generateQrCode } from "../../../shared/utils/gym/qr.utils";
import {
  extractPhotoUrl,
  markUploadedPhoto,
} from "../../../shared/utils/gym/photo.utils";
import { ConflictError } from "../../../shared/utils/custom-errors";

export class CreateMemberLogic {
  /**
   * Create a gym member with auto-generated QR token and optional photo.
   * @param data - Member payload including optional uploaded photo array
   * @param language - i18n language code
   * @returns Created member document
   * @throws ConflictError when email already exists
   */
  async create(data: Input, language = "en") {
    data = inputSchema.parse(data);

    const existing = await Member.findOne({
      email: data.email,
      isDeleted: false,
    });
    if (existing) {
      throw new ConflictError("emailInUse");
    }

    const photoUrl = extractPhotoUrl(data.photo);
    await markUploadedPhoto(data.photo);

    try {
      const member = await Member.create({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        membershipStatus: data.membershipStatus,
        subscriptionPlanId: data.subscriptionPlanId,
        photo: photoUrl,
        qrCode: generateQrCode(),
      });
      return member;
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new ConflictError("emailInUse");
      }
      throw error;
    }
  }
}
