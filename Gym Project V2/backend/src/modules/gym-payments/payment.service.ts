import Stripe from "stripe";
import { z } from "zod";
import GymPayment from "./gymPayment.model";
import Subscription from "../subscriptions/subscription.model";
import Member from "../members/member.model";
import User from "../users/user.model";
import SubscriptionPlan from "../plans/subscriptionPlan.model";
import { mongoIdSchema } from "../../shared/utils/custom-checckers";
import { NotFoundError, BadRequestError } from "../../shared/utils/custom-errors";
import { generateQrCode } from "../../shared/utils/gym/qr.utils";
import Notification from "../notifications/notification.model";

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

  /**
   * List payments for a specific member (paginated).
   */
  async getMemberPayments(
    memberId: string,
    pagination: { page: number; limit: number; skip: number }
  ) {
    const [items, total] = await Promise.all([
      GymPayment.find({ memberId })
        .sort({ dueDate: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      GymPayment.countDocuments({ memberId }),
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
   * Monthly revenue stats for a given year.
   */
  async getRevenueStats(year?: number) {
    const y = year ?? new Date().getFullYear();
    const start = new Date(y, 0, 1);
    const end = new Date(y + 1, 0, 1);

    return GymPayment.aggregate([
      { $match: { status: "paid", paidAt: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: { $month: "$paidAt" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { month: "$_id", total: 1, count: 1, _id: 0 } },
    ]);
  }

  /**
   * Create a Stripe Checkout Session for a member to subscribe to a plan.
   * Resolves the member from the authenticated user — creates one if missing.
   */
  async createCheckoutSession(
    planId: string,
    authUser: { id: string; memberId?: string; email?: string; name?: string }
  ) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new BadRequestError("stripeNotConfigured");
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.isActive) throw new NotFoundError("planNotFound");

    // Resolve member: by memberId, or by email, or create a new one
    let member = authUser.memberId
      ? await Member.findById(authUser.memberId)
      : null;

    if (!member) {
      const dbUser = await User.findById(authUser.id);
      if (dbUser?.memberId) {
        member = await Member.findById(dbUser.memberId);
      }
      if (!member && dbUser?.email) {
        member = await Member.findOne({ email: dbUser.email });
      }
      if (!member && dbUser) {
        // Auto-create member profile and link it
        const nameParts = (dbUser.name ?? "").split(" ");
        member = await Member.create({
          fullName: dbUser.name ?? "Member",
          email: dbUser.email,
          phone: dbUser.phone ?? "0000000000",
          membershipStatus: "active",
          qrCode: generateQrCode(),
        });
        dbUser.memberId = member._id as any;
        await dbUser.save();
      }
    }

    if (!member) throw new NotFoundError("memberNotFound");

    const stripe = new Stripe(secretKey);
    const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:4200";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: (plan.currency ?? "USD").toLowerCase(),
            product_data: {
              name: plan.name,
              description: plan.description || undefined,
            },
            unit_amount: Math.round(plan.price * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        memberId: (member._id as any).toString(),
        planId: planId.toString(),
      },
      success_url: `${frontendUrl}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/payments/cancel`,
      customer_email: member.email,
    });

    return {
      sessionId: session.id,
      sessionUrl: session.url,
    };
  }

  /**
   * Handle Stripe webhook event — fulfills checkout.session.completed.
   */
  async handleStripeWebhook(rawBody: Buffer, signature: string) {
    const secret = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new BadRequestError("stripeNotConfigured");

    const stripe = new Stripe(secret);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let event: any;
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } else {
      // Dev mode — parse body directly without signature verification
      event = JSON.parse(rawBody.toString());
    }

    if (event.type === "checkout.session.completed") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const session: any = event.data.object;
      const { memberId, planId } = (session.metadata ?? {}) as Record<string, string>;
      if (!memberId || !planId) return { received: true };

      const plan = await SubscriptionPlan.findById(planId);
      if (!plan) return { received: true };

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + plan.durationMonths);

      const payment = await GymPayment.create({
        memberId,
        amount: plan.price,
        method: "online",
        status: "paid",
        paidAt: new Date(),
        dueDate: startDate,
        stripeSessionId: session.id,
      });

      const subscription = await Subscription.create({
        memberId,
        planId,
        startDate,
        endDate,
        status: "active",
        paymentId: payment._id,
      });

      payment.set("subscriptionId", subscription._id);
      await payment.save();

      await Member.findByIdAndUpdate(memberId, {
        subscriptionPlanId: planId,
        membershipStatus: "active",
      });
    }

    return { received: true };
  }

  /**
   * Verify a Stripe Checkout Session and fulfill the subscription if paid.
   */
  async verifyAndFulfillSession(sessionId: string, authUserId: string) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) throw new BadRequestError("stripeNotConfigured");

    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return { fulfilled: false, reason: 'notPaid' };
    }

    const { memberId, planId } = (session.metadata ?? {}) as Record<string, string>;
    if (!memberId || !planId) return { fulfilled: false, reason: 'noMetadata' };

    // Idempotency: if subscription already exists, return it
    const existing = await Subscription.findOne({ memberId, planId, status: 'active' }).populate('planId');
    if (existing) return { fulfilled: true, subscription: existing };

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) throw new NotFoundError('planNotFound');

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    const payment = await GymPayment.create({
      memberId,
      amount: plan.price,
      method: 'online',
      status: 'paid',
      paidAt: new Date(),
      dueDate: startDate,
      stripeSessionId: session.id,
    });

    const subscription = await Subscription.create({
      memberId,
      planId,
      startDate,
      endDate,
      status: 'active',
      paymentId: payment._id,
    });

    payment.set('subscriptionId', subscription._id);
    await payment.save();

    await Member.findByIdAndUpdate(memberId, {
      subscriptionPlanId: planId,
      membershipStatus: 'active',
    });

    // Find the user linked to this member to send notification
    const user = await User.findOne({ memberId });
    if (user) {
      await Notification.create({
        target: 'user',
        user: user._id,
        title_en: 'Subscription Activated',
        message_en: `Your ${plan.name} subscription is now active until ${endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`,
        title_ar: 'تم تفعيل الاشتراك',
        message_ar: `اشتراكك ${plan.name} نشط الآن حتى ${endDate.toLocaleDateString('ar-SA')}.`,
        type: 'payment-success',
        isRead: false,
        action: 'none',
      });
    }

    return { fulfilled: true, subscription: await subscription.populate('planId') };
  }
}
