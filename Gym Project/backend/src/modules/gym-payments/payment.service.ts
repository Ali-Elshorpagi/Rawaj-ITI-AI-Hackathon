import { z } from "zod";
import GymPayment from "./gymPayment.model";
import { mongoIdSchema } from "../../shared/utils/custom-checckers";
import { NotFoundError } from "../../shared/utils/custom-errors";

const createSchema = z.object({
  memberId: mongoIdSchema,
  subscriptionId: mongoIdSchema.optional(),
  amount: z.number().min(0),
  method: z.enum(["cash", "card", "bank_transfer", "online"]),
  status: z.enum(["paid", "pending", "overdue"]).optional(),
  dueDate: z.coerce.date(),
  paidAt: z.coerce.date().optional(),
});

const updateSchema = z.object({
  amount: z.number().min(0).optional(),
  method: z.enum(["cash", "card", "bank_transfer", "online"]).optional(),
  status: z.enum(["paid", "pending", "overdue"]).optional(),
  dueDate: z.coerce.date().optional(),
  paidAt: z.coerce.date().optional(),
});

export class GymPaymentService {
  /**
   * List payments with optional filters and pagination.
   */
  async listPayments(
    pagination: { page: number; limit: number; skip: number },
    query: Record<string, unknown>
  ) {
    const filter: Record<string, unknown> = {};
    if (query.memberId) filter.memberId = query.memberId;
    if (query.status) filter.status = query.status;
    if (query.from || query.to) {
      filter.dueDate = {};
      if (query.from) (filter.dueDate as any).$gte = new Date(query.from as string);
      if (query.to) (filter.dueDate as any).$lte = new Date(query.to as string);
    }

    const [items, total] = await Promise.all([
      GymPayment.find(filter)
        .sort({ dueDate: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .populate("memberId"),
      GymPayment.countDocuments(filter),
    ]);

    return {
      items,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  /**
   * Record a new payment.
   */
  async createPayment(data: unknown) {
    const parsed = createSchema.parse(data);
    if (parsed.status === "paid" && !parsed.paidAt) {
      parsed.paidAt = new Date();
    }
    return GymPayment.create(parsed);
  }

  /**
   * Update payment status or details.
   */
  async updatePayment(id: string, data: unknown) {
    const parsedId = mongoIdSchema.parse(id);
    const parsed = updateSchema.parse(data);
    if (parsed.status === "paid" && !parsed.paidAt) {
      parsed.paidAt = new Date();
    }
    const payment = await GymPayment.findByIdAndUpdate(parsedId, parsed, {
      new: true,
    });
    if (!payment) throw new NotFoundError("paymentNotFound");
    return payment;
  }

  /**
   * List all overdue payments.
   */
  async getOverdue() {
    return GymPayment.find({ status: "overdue" })
      .populate("memberId")
      .sort({ dueDate: 1 });
  }
}
