import { MailerService } from "../../shared/utils/email-system/mailer";
import { AuthService } from "./auth.service";
import { AuthRouter } from "./auth.router";

export class AuthModule {
  authService: AuthService;
  authRouter: AuthRouter;

  constructor(mailerService: MailerService) {
    this.authService = new AuthService(mailerService);
    this.authRouter = new AuthRouter(this.authService);
  }

  routerFactory() {
    return this.authRouter.createRouter();
  }
}
