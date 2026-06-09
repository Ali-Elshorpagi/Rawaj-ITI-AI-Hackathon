import Member from "../member.model";
import { querySchema, QueryInput } from "./input";

export class ListMembersLogic {
  /**
   * List members with optional filters and pagination.
   * @param pagination - page, limit, skip
   * @param query - name, status, planId filters
   * @returns Paginated member list and total count
   */
  async list(
    pagination: { page: number; limit: number; skip: number },
    query: Record<string, unknown>
  ) {
    const parsed = querySchema.parse({ ...query, pagination });
    const filter: Record<string, unknown> = { isDeleted: false };

    if (parsed.name) {
      filter.fullName = { $regex: parsed.name, $options: "i" };
    }
    if (parsed.status) {
      filter.membershipStatus = parsed.status;
    }
    if (parsed.planId) {
      filter.subscriptionPlanId = parsed.planId;
    }

    const [items, total] = await Promise.all([
      Member.find(filter)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .sort({ createdAt: -1 }),
      Member.countDocuments(filter),
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
}
