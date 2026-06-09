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
}
