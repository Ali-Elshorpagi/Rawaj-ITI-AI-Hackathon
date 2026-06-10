import bcrypt from "bcrypt";
import User from "../../users/user.model";
import { inputSchema, Input } from "./input";
import { generateToken } from "../../../shared/utils/auth/tokenUtils";
import {
  InvalidCredentialsError,
  NotFoundError,
  UnauthorizedError,
} from "../../../shared/utils/custom-errors";
import { VerifyLogic } from "../verify/logic";
import { GymRole } from "../../../shared/constants/gym-roles";

export class LoginLogic {
  constructor(private verifyLogic: VerifyLogic) {}

  /**
   * Login with email/password/role. Resends OTP if account unverified.
   */
  async login(data: Input, language = "en") {
    data = inputSchema.parse(data);
    const { email, password, role: requestedRole } = data;

    const user = await User.findOne({
      $or: [{ email }, { phone: email }],
    });

    if (!user) {
      throw new NotFoundError("userNotRegistered");
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new InvalidCredentialsError("wrongPassword");
    }

    const userData = user.toObject() as unknown as Record<string, unknown>;
    delete userData.password;
    delete userData.__v;
    delete userData.otp;

    if (user.isVerified === false) {
      await this.verifyLogic.resendOtp({ email: user.email });
      return { user: { ...userData, id: user._id } };
    }

    const role = requestedRole ?? user.roles[0];

    if (!user.roles.includes(role)) {
      throw new UnauthorizedError("userNotAllowed");
    }

    const token = await generateToken(
      user._id,
      "active",
      "never",
      role as GymRole
    );

    return {
      token,
      user: { ...userData, id: user._id, role },
    };
  }
}
