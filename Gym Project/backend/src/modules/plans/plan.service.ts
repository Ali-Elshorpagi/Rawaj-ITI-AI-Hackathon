import { z } from "zod";
import SubscriptionPlan from "./subscriptionPlan.model";
import { mongoIdSchema } from "../../shared/utils/custom-checckers";
import { NotFoundError } from "../../shared/utils/custom-errors";

const createSchema = z.object({
  name: z.string().min(1),
  durationMonths: z.number().int().min(1),
  price: z.number().min(0),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

const updateSchema = createSchema.partial();

export class PlanService {
  /**
   * List all active subscription plans (public).
   */
  async listPlans() {
    return SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
  }

  /**
   * Create a subscription plan.
   */
  async createPlan(data: unknown) {
    const parsed = createSchema.parse(data);
    return SubscriptionPlan.create(parsed);
  }

  /**
   * Update a subscription plan.
   */
  async updatePlan(id: string, data: unknown) {
    const parsedId = mongoIdSchema.parse(id);
    const parsed = updateSchema.parse(data);
    const plan = await SubscriptionPlan.findByIdAndUpdate(parsedId, parsed, {
      new: true,
    });
    if (!plan) throw new NotFoundError("planNotFound");
    return plan;
  }

  /**
   * Soft-deactivate a subscription plan.
   */
  async deletePlan(id: string) {
    const parsedId = mongoIdSchema.parse(id);
    const plan = await SubscriptionPlan.findByIdAndUpdate(
      parsedId,
      { isActive: false },
      { new: true }
    );
    if (!plan) throw new NotFoundError("planNotFound");
    return plan;
  }
}
