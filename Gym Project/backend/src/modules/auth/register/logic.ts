import bcrypt from "bcrypt";
import User from "../../users/user.model";
import { config } from "../../../shared/config";
import { inputSchema, Input } from "./input";
import { generateOtp } from "../../../shared/utils/otp";
import { MailerService } from "../../../shared/utils/email-system/mailer";
import { InvalidCredentialsError } from "../../../shared/utils/custom-errors";
import { GymRole } from "../../../shared/constants/gym-roles";

export class RegisterLogic {
  constructor(private mailerService: MailerService) {}

  /**
   * Register user, send OTP email, return user without sensitive fields.
   */
  async register(data: Input, language = "en") {
    data = inputSchema.parse(data);

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new InvalidCredentialsError("emailInUse");
    }

    const existingPhone = await User.findOne({ phone: data.phone });
    if (existingPhone) {
      throw new InvalidCredentialsError("phoneInUse");
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      config.bcrypt.saltRounds
    );

    const otpCode = generateOtp();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    const newUser = await User.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      address: data.address,
      roles: [data.role as GymRole],
      isVerified: false,
      otp: { code: otpCode, expiry: otpExpiry },
    });

    await this.mailerService.sendOtpEmail(newUser.email, otpCode);

    const userData = newUser.toObject() as unknown as Record<string, unknown>;
    delete userData.password;
    delete userData.__v;
    delete userData.otp;

    return { ...userData, id: newUser._id };
  }
}
