import { Request, Response, NextFunction } from "express";
import { GymPaymentService } from "./payment.service";

export class GymPaymentController {
  constructor(private paymentService: GymPaymentService) {}

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.paymentService.listPayments(
        req.pagination ?? { page: 1, limit: 10, skip: 0 },
        req.query ?? {}
      );
      res.sendSuccess("Payments fetched", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.paymentService.createPayment(req.body);
      res.sendSuccess("Payment created", result, 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.paymentService.updatePayment(
        req.params.id,
        req.body
      );
      res.sendSuccess("Payment updated", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async overdue(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.paymentService.getOverdue();
      res.sendSuccess("Overdue payments fetched", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async memberPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.paymentService.getMemberPayments(
        req.params.memberId,
        req.pagination ?? { page: 1, limit: 10, skip: 0 }
      );
      res.sendSuccess("Member payments fetched", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async revenueStats(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.paymentService.getRevenueStats(
        req.query.year ? Number(req.query.year) : undefined
      );
      res.sendSuccess("Revenue stats fetched", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const { planId } = req.body;
      const result = await this.paymentService.createCheckoutSession(planId, {
        id: req.user.id,
        memberId: req.user.memberId,
        email: req.user.email,
        name: req.user.name,
      });
      res.sendSuccess("Checkout session created", result, 201);
    } catch (error) {
      next(error);
    }
  }

  async stripeWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers["stripe-signature"] as string ?? "";
      const rawBody: Buffer = (req as any).rawBody ?? Buffer.from(JSON.stringify(req.body));
      const result = await this.paymentService.handleStripeWebhook(rawBody, signature);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async verifySession(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.body;
      const result = await this.paymentService.verifyAndFulfillSession(sessionId, req.user.id);
      res.sendSuccess("Session verified", result, 200);
    } catch (error) {
      next(error);
    }
  }
}
