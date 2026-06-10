import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.authService.register(req.body, req.language);
      res.sendSuccess(req.t("user.created"), result, 201);
    } catch (error) {
      next(error);
    }
  }

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.authService.verify(req.body, req.language);
      res.sendSuccess(req.t("user.verified"), result, 200);
    } catch (error) {
      next(error);
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.authService.resendOtp(req.body, req.language);
      res.sendSuccess(req.t("user.resentOtp"), result, 200);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.authService.login(req.body, req.language);
      if ("token" in result) {
        res.sendSuccess(req.t("user.login_verified"), result, 200);
      } else {
        res.sendSuccess(req.t("user.login_unverified"), result, 200);
      }
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.authService.getMe(req.user.id, req.user.role);
      res.sendSuccess(req.t("user.fetched"), result, 200);
    } catch (error) {
      next(error);
    }
  }

  async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.authService.updatePassword(
        req.body,
        req.user.id,
        req.language
      );
      res.sendSuccess(req.t("user.password_updated"), result, 200);
    } catch (error) {
      next(error);
    }
  }

  async requestPasswordReset(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await this.authService.requestPasswordReset(
        email,
        req.language
      );
      res.sendSuccess(req.t("user.password_reset_request"), result, 200);
    } catch (error) {
      next(error);
    }
  }

  async verifyResetPasswordOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.authService.verifyResetPasswordOtp(
        req.body,
        req.language
      );
      res.sendSuccess(req.t("user.otp_verified"), result, 200);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.authService.resetPassword(
        req.body,
        req.language
      );
      res.sendSuccess(req.t("user.password_updated"), result, 200);
    } catch (error) {
      next(error);
    }
  }
}
