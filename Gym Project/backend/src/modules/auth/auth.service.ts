import { MailerService } from "../../shared/utils/email-system/mailer";
import { RegisterLogic } from "./register/logic";
import { VerifyLogic } from "./verify/logic";
import { LoginLogic } from "./login/logic";
import { MeLogic } from "./me/logic";
import { UpdatePasswordLogic } from "./update-password/logic";
import { ResetPasswordLogic } from "./reset-password/logic";

export class AuthService {
  private registerLogic: RegisterLogic;
  private verifyLogic: VerifyLogic;
  private loginLogic: LoginLogic;
  private meLogic = new MeLogic();
  private updatePasswordLogic = new UpdatePasswordLogic();
  private resetPasswordLogic: ResetPasswordLogic;

  constructor(mailerService: MailerService) {
    this.registerLogic = new RegisterLogic(mailerService);
    this.verifyLogic = new VerifyLogic(mailerService);
    this.loginLogic = new LoginLogic(this.verifyLogic);
    this.resetPasswordLogic = new ResetPasswordLogic(mailerService);
  }

  register(data: unknown, language?: string) {
    return this.registerLogic.register(data as any, language);
  }

  verify(data: unknown, language?: string) {
    return this.verifyLogic.verifyUser(data as any, language);
  }

  resendOtp(data: unknown, language?: string) {
    return this.verifyLogic.resendOtp(data as any, language);
  }

  login(data: unknown, language?: string) {
    return this.loginLogic.login(data as any, language);
  }

  getMe(userId: string, role?: string) {
    return this.meLogic.getMe(userId, role);
  }

  updatePassword(data: unknown, userId: string, language?: string) {
    return this.updatePasswordLogic.updatePassword(
      { data, userId } as any,
      language
    );
  }

  requestPasswordReset(email: string, language?: string) {
    return this.resetPasswordLogic.resetRequest({ email }, language);
  }

  verifyResetPasswordOtp(data: unknown, language?: string) {
    return this.resetPasswordLogic.resetPasswordOtpVerify(data as any, language);
  }

  resetPassword(data: unknown, language?: string) {
    return this.resetPasswordLogic.resetPassword(data as any, language);
  }
}
