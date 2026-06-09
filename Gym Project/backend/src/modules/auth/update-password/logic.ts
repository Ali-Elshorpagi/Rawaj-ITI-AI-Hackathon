import bcrypt from "bcrypt";
import User from "../../users/user.model";
import { inputSchema, Input } from "./input";
import { config } from "../../../shared/config";
import { InvalidCredentialsError } from "../../../shared/utils/custom-errors";

export class UpdatePasswordLogic {
  /**
   * Change password for authenticated user.
   */
  async updatePassword(input: Input, language = "en") {
    const { data, userId } = inputSchema.parse(input);

    const user = await User.findById(userId);
    if (!user) {
      throw new InvalidCredentialsError("userNotFound");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsError("invalidPassword");
    }

    const hashedPassword = await bcrypt.hash(
      data.newPassword,
      config.bcrypt.saltRounds
    );
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    const userData = user.toObject() as unknown as Record<string, unknown>;
    delete userData.password;
    delete userData.__v;
    delete userData.otp;

    return { ...userData, id: user._id };
  }
}
