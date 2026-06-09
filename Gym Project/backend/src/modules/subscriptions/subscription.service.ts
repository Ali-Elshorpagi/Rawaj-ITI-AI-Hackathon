import { z } from "zod";
import Subscription from "./subscription.model";
import SubscriptionPlan from "../plans/subscriptionPlan.model";
import Member from "../members/member.model";
import GymPayment from "../gym-payments/gymPayment.model";
import { mongoIdSchema } from "../../shared/utils/custom-checckers";
import { NotFoundError } from "../../shared/utils/custom-errors";

const createSchema = z.object({
  memberId: mongoIdSchema,
  planId: mongoIdSchema,
  method: z.enum(["cash", "card", "bank_transfer", "online"]).default("cash"),
});

export class SubscriptionService {
  /**
   * Assign a plan to a member and create linked payment record.
   */
  async createSubscription(data: unknown) {
    const parsed = createSchema.parse(data);
    const [member, plan] = await Promise.all([
      Member.findOne({ _id: parsed.memberId, isDeleted: false }),
      SubscriptionPlan.findById(parsed.planId),
    ]);
    if (!member) throw new NotFoundError("memberNotFound");
    if (!plan) throw new NotFoundError("planNotFound");

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    const payment = await GymPayment.create({
      memberId: parsed.memberId,
      amount: plan.price,
      method: parsed.method,
      status: "pending",
      dueDate: startDate,
    });

    const subscription = await Subscription.create({
      memberId: parsed.memberId,
      planId: parsed.planId,
      startDate,
      endDate,
      status: "active",
      paymentId: payment._id,
    });

    payment.subscriptionId = subscription._id as any;
    await payment.save();

    member.subscriptionPlanId = plan._id as any;
    member.membershipStatus = "active";
    await member.save();

    return subscription.populate(["planId", "paymentId"]);
  }

  /**
   * Renew subscription by extending endDate and creating new payment.
   */
  async renewSubscription(id: string, data: unknown) {
    const parsedId = mongoIdSchema.parse(id);
    const methodSchema = z.object({
      method: z.enum(["cash", "card", "bank_transfer", "online"]).default("cash"),
    });
    const { method } = methodSchema.parse(data ?? {});

    const subscription = await Subscription.findById(parsedId).populate("planId");
    if (!subscription) throw new NotFoundError("subscriptionNotFound");

    const plan = subscription.planId as any;
    const newEnd = new Date(subscription.endDate);
    newEnd.setMonth(newEnd.getMonth() + plan.durationMonths);

    const payment = await GymPayment.create({
      memberId: subscription.memberId,
      amount: plan.price,
      method,
      status: "pending",
      dueDate: new Date(),
    });

    subscription.endDate = newEnd;
    subscription.status = "active";
    subscription.paymentId = payment._id as any;
    await subscription.save();

    payment.subscriptionId = subscription._id as any;
    await payment.save();

    return subscription.populate(["planId", "paymentId"]);
  }

  /**
   * List subscriptions expiring within N days.
   */
  async getExpiring(days = 7) {
    const now = new Date();
    const until = new Date();
    until.setDate(until.getDate() + days);

    return Subscription.find({
      status: "active",
      endDate: { $gte: now, $lte: until },
    })
      .populate("memberId")
      .populate("planId");
  }
}
