import User from "../../users/user.model";
import {
  verifyInputSchema,
  resendOtpInputSchema,
  VerifyInput,
  ResendOtpInput,
} from "./input";
import { generateOtp } from "../../../shared/utils/otp";
import { MailerService } from "../../../shared/utils/email-system/mailer";
import { InvalidCredentialsError } from "../../../shared/utils/custom-errors";
import { generateToken } from "../../../shared/utils/auth/tokenUtils";
import { GymRole } from "../../../shared/constants/gym-roles";

export class VerifyLogic {
  constructor(private mailerService: MailerService) {}

  /**
   * Verify OTP, mark user verified, send welcome email, return JWT.
   */
  async verifyUser(data: VerifyInput, language = "en") {
    data = verifyInputSchema.parse(data);
    const { otp, email } = data;

    const user = await User.findOne({ email });
    if (!user) {
      throw new InvalidCredentialsError("userNotFound");
    }
    if (!user.otp) {
      throw new InvalidCredentialsError("otpNotGenerated");
    }
    if (user.otp.code !== otp) {
      throw new InvalidCredentialsError("invalidOtp");
    }
    if (user.otp.expiry < new Date()) {
      throw new InvalidCredentialsError("otpExpired");
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    await this.mailerService.sendWelcomeEmail(user.email, user.name);

    const userData = user.toObject() as unknown as Record<string, unknown>;
    delete userData.password;
    delete userData.__v;
    delete userData.otp;

    const role = user.roles[0] as GymRole;
    const token = await generateToken(user._id, "active", "never", role);

    return {
      token,
      user: { ...userData, id: user._id, role },
    };
  }

  /**
   * Resend OTP to unverified user.
   */
  async resendOtp(data: ResendOtpInput, language = "en") {
    data = resendOtpInputSchema.parse(data);

    const user = await User.findOne({ email: data.email });
    if (!user) {
      throw new InvalidCredentialsError("userNotFound");
    }
    if (user.isVerified) {
      throw new InvalidCredentialsError("alreadyVerified");
    }

    const otpCode = generateOtp();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    user.otp = { code: otpCode, expiry: otpExpiry };
    await user.save();

    await this.mailerService.sendOtpEmail(user.email, otpCode);

    const userData = user.toObject() as unknown as Record<string, unknown>;
    delete userData.password;
    delete userData.__v;
    delete userData.otp;

    return { ...userData, id: user._id };
  }
}
