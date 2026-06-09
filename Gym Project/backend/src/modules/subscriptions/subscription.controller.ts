import { Request, Response, NextFunction } from "express";
import { SubscriptionService } from "./subscription.service";

export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.subscriptionService.createSubscription(req.body);
      res.sendSuccess("Subscription created", result, 201);
    } catch (error) {
      next(error);
    }
  }

  async renew(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.subscriptionService.renewSubscription(
        req.params.id,
        req.body
      );
      res.sendSuccess("Subscription renewed", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async expiring(req: Request, res: Response, next: NextFunction) {
    try {
      const days = parseInt((req.query.days as string) || "7", 10);
      const result = await this.subscriptionService.getExpiring(days);
      res.sendSuccess("Expiring subscriptions fetched", result, 200);
    } catch (error) {
      next(error);
    }
  }
}
