import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { GymAuthMiddleware } from "../../shared/middlewares/auth";
import { upload } from "../../shared/middlewares/upload";

export class AuthRouter {
  private authController: AuthController;
  private gymAuthMiddleware = new GymAuthMiddleware();

  constructor(authService: AuthService) {
    this.authController = new AuthController(authService);
  }

  createRouter() {
    const router = Router();
    const auth = this.gymAuthMiddleware.authenticate.bind(this.gymAuthMiddleware);

    router.post(
      "/register",
      upload.any(),
      this.authController.register.bind(this.authController)
    );
    router.post(
      "/verify",
      upload.any(),
      this.authController.verify.bind(this.authController)
    );
    router.post(
      "/resend-otp",
      upload.any(),
      this.authController.resendOtp.bind(this.authController)
    );
    router.post(
      "/login",
      upload.any(),
      this.authController.login.bind(this.authController)
    );
    router.post(
      "/update-password",
      upload.any(),
      auth,
      this.authController.updatePassword.bind(this.authController)
    );
    router.post(
      "/request-password-reset",
      upload.any(),
      this.authController.requestPasswordReset.bind(this.authController)
    );
    router.post(
      "/verify-reset-password-otp",
      upload.any(),
      this.authController.verifyResetPasswordOtp.bind(this.authController)
    );
    router.post(
      "/reset-password",
      upload.any(),
      this.authController.resetPassword.bind(this.authController)
    );
    router.get("/me", auth, this.authController.me.bind(this.authController));

    return router;
  }
}
