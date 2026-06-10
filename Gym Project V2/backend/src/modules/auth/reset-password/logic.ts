import bcrypt from "bcrypt";
import User from "../../users/user.model";
import {
  requestResetPasswordInputSchema,
  otpVerifyInputSchema,
  resetPasswordInputSchema,
  RequestResetInput,
  OtpVerifyInput,
  ResetPasswordInput,
} from "./input";
import { generateOtp } from "../../../shared/utils/otp";
import { MailerService } from "../../../shared/utils/email-system/mailer";
import {
  generateTempToken,
  validateTempToken,
  deleteTempToken,
} from "../../../shared/utils/auth/tempTokenUtils";
import { config } from "../../../shared/config";
import {
  InvalidCredentialsError,
  NotFoundError,
} from "../../../shared/utils/custom-errors";

export class ResetPasswordLogic {
  constructor(private mailerService: MailerService) {}

  /**
   * Send password reset OTP to user email.
   */
  async resetRequest({ email }: RequestResetInput, language = "en") {
    const parsed = requestResetPasswordInputSchema.parse({ email });

    const user = await User.findOne({
      $or: [{ email: parsed.email }, { phone: parsed.email }],
    });
    if (!user) {
      throw new NotFoundError("userNotFound");
    }

    const otpCode = generateOtp();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    user.otp = { code: otpCode, expiry: otpExpiry };
    await user.save();

    await this.mailerService.sendOtpEmail(user.email, otpCode);
    return null;
  }

  /**
   * Verify reset OTP and return temporary token for password change.
   */
  async resetPasswordOtpVerify(
    { email, otp }: OtpVerifyInput,
    language = "en"
  ) {
    const parsed = otpVerifyInputSchema.parse({ email, otp });

    const user = await User.findOne({
      $or: [{ email: parsed.email }, { phone: parsed.email }],
    });
    if (!user) {
      throw new InvalidCredentialsError("userNotFound");
    }
    if (!user.otp) {
      throw new InvalidCredentialsError("otpNotGenerated");
    }
    if (user.otp.expiry < new Date()) {
      throw new InvalidCredentialsError("otpExpired");
    }
    if (user.otp.code !== parsed.otp) {
      throw new InvalidCredentialsError("invalidOtp");
    }

    user.otp = undefined;
    await user.save();

    const tempToken = await generateTempToken(user._id, user.email);
    return { token: tempToken };
  }

  /**
   * Set new password using temporary reset token.
   */
  async resetPassword(
    { password, token }: ResetPasswordInput,
    language = "en"
  ) {
    const parsed = resetPasswordInputSchema.parse({ password, token });

    const data = await validateTempToken(parsed.token);
    if (!data) {
      throw new InvalidCredentialsError("invalidToken");
    }

    const user = await User.findById(data.id);
    if (!user) {
      throw new InvalidCredentialsError("userNotFound");
    }

    const hashedPassword = await bcrypt.hash(
      parsed.password,
      config.bcrypt.saltRounds
    );
    user.password = hashedPassword;
    await user.save();

    await deleteTempToken(parsed.token);
    return null;
  }
}
