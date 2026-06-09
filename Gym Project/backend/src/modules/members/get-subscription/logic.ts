import Subscription from "../../subscriptions/subscription.model";
import { mongoIdSchema } from "../../../shared/utils/custom-checckers";
import { GetMemberLogic } from "../get/logic";

export class GetMemberSubscriptionLogic {
  private getMemberLogic = new GetMemberLogic();

  /**
   * Get the active subscription for a member.
   * @param memberId - Member MongoDB id
   * @returns Active subscription or null
   */
  async getSubscription(memberId: string) {
    await this.getMemberLogic.get(memberId);
    const parsedId = mongoIdSchema.parse(memberId);

    const subscription = await Subscription.findOne({
      memberId: parsedId,
      status: "active",
    })
      .populate("planId")
      .populate("paymentId");

    return subscription;
  }
}
