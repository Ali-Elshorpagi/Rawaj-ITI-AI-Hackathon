import User from "../../users/user.model";
import { NotFoundError } from "../../../shared/utils/custom-errors";

export class MeLogic {
  /**
   * Return the authenticated user's profile.
   * @param userId - JWT user id
   * @param role - Active role from JWT
   * @returns User profile
   * @throws NotFoundError when user does not exist
   */
  async getMe(userId: string, role?: string) {
    const user = await User.findById(userId).select("-password -otp");
    if (!user) {
      throw new NotFoundError("userNotRegistered");
    }
    return { ...user.toObject(), id: user._id, role };
  }
}
