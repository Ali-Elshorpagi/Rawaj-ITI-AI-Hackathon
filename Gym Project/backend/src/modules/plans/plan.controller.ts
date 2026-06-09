import { Request, Response, NextFunction } from "express";
import { PlanService } from "./plan.service";

export class PlanController {
  constructor(private planService: PlanService) {}

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.planService.listPlans();
      res.sendSuccess("Plans fetched", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.planService.createPlan(req.body);
      res.sendSuccess("Plan created", result, 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.planService.updatePlan(req.params.id, req.body);
      res.sendSuccess("Plan updated", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.planService.deletePlan(req.params.id);
      res.sendSuccess("Plan deactivated", result, 200);
    } catch (error) {
      next(error);
    }
  }
}
