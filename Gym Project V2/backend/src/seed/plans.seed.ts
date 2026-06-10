import dotenv from "dotenv";
import { connectDatabase } from "../shared/database/connect";
import SubscriptionPlan from "../modules/plans/subscriptionPlan.model";

dotenv.config();

async function seedPlans() {
  await connectDatabase();
  console.log("🌱 Seeding subscription plans...");

  const count = await SubscriptionPlan.countDocuments({ isActive: true });
  if (count > 0) {
    console.log(`✅ ${count} active plans already exist — skipping seed.`);
    process.exit(0);
  }

  await SubscriptionPlan.insertMany([
    {
      name: "Starter Monthly",
      durationMonths: 1,
      durationDays: 30,
      price: 29.99,
      currency: "USD",
      description: "Perfect for getting started",
      color: "#6366F1",
      features: [
        "Access to gym floor",
        "Cardio equipment",
        "Locker room",
        "1 free fitness assessment",
      ],
      isPopular: false,
      isActive: true,
    },
    {
      name: "Pro Quarterly",
      durationMonths: 3,
      durationDays: 90,
      price: 79.99,
      currency: "USD",
      description: "Best value for regular members",
      color: "#0D9488",
      features: [
        "All Starter benefits",
        "Unlimited group classes",
        "Pool & sauna access",
        "2 personal training sessions",
        "Nutrition guide",
      ],
      isPopular: true,
      isActive: true,
    },
    {
      name: "Elite Annual",
      durationMonths: 12,
      durationDays: 365,
      price: 249.99,
      currency: "USD",
      description: "Maximum savings for dedicated members",
      color: "#D97706",
      features: [
        "All Pro benefits",
        "Unlimited personal training",
        "Priority class booking",
        "Guest passes (4/month)",
        "Exclusive member events",
        "Free merchandise kit",
      ],
      isPopular: false,
      isActive: true,
    },
  ]);

  console.log("✅ 3 subscription plans seeded successfully.");
  process.exit(0);
}

seedPlans().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
