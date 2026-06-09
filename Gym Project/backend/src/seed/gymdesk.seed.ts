import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { connectDatabase } from "../shared/database/connect";
import { config } from "../shared/config";
import SubscriptionPlan from "../modules/plans/subscriptionPlan.model";
import Member from "../modules/members/member.model";
import Trainer from "../modules/trainers/trainer.model";
import FitnessClass from "../modules/classes/fitnessClass.model";
import Attendance from "../modules/attendance/attendance.model";
import GymPayment from "../modules/gym-payments/gymPayment.model";
import Subscription from "../modules/subscriptions/subscription.model";
import User from "../modules/users/user.model";
import { generateQrCode } from "../shared/utils/gym/qr.utils";

dotenv.config();

const PLACEHOLDER_PHOTO =
  "https://res.cloudinary.com/demo/image/upload/sample.jpg";

async function seed() {
  await connectDatabase();
  console.log("🌱 Seeding GymDesk data...");

  await Promise.all([
    SubscriptionPlan.deleteMany({}),
    Member.deleteMany({}),
    Trainer.deleteMany({}),
    FitnessClass.deleteMany({}),
    Attendance.deleteMany({}),
    GymPayment.deleteMany({}),
    Subscription.deleteMany({}),
    User.deleteMany({ roles: { $in: ["trainer", "reception", "owner"] } }),
  ]);

  const plans = await SubscriptionPlan.insertMany([
    {
      name: "Basic Monthly",
      durationMonths: 1,
      price: 49.99,
      description: "Access to gym floor and cardio equipment",
      isActive: true,
    },
    {
      name: "Premium Annual",
      durationMonths: 12,
      price: 499.99,
      description: "Full access including classes and personal training discount",
      isActive: true,
    },
  ]);

  const password = await bcrypt.hash("Password123!", config.bcrypt.saltRounds);

  const owner = await User.create({
    name: "Gym Owner",
    email: "owner@gymdesk.local",
    phone: "+10000000001",
    password,
    roles: ["owner"],
    isVerified: true,
  });

  const trainerUsers = await User.insertMany([
    {
      name: "Alex Trainer",
      email: "alex@gymdesk.local",
      phone: "+10000000002",
      password,
      roles: ["trainer"],
      isVerified: true,
    },
    {
      name: "Sam Coach",
      email: "sam@gymdesk.local",
      phone: "+10000000003",
      password,
      roles: ["trainer"],
      isVerified: true,
    },
  ]);

  const trainers = await Trainer.insertMany([
    {
      userId: trainerUsers[0]._id,
      specialization: "Strength & Conditioning",
      bio: "Certified personal trainer with 8 years experience",
      photo: PLACEHOLDER_PHOTO,
    },
    {
      userId: trainerUsers[1]._id,
      specialization: "Yoga & Flexibility",
      bio: "RYT-500 yoga instructor",
      photo: PLACEHOLDER_PHOTO,
    },
  ]);

  const members = await Member.insertMany([
    {
      fullName: "John Active",
      email: "john.active@gymdesk.local",
      phone: "+10000000010",
      photo: PLACEHOLDER_PHOTO,
      membershipStatus: "active",
      subscriptionPlanId: plans[0]._id,
      qrCode: generateQrCode(),
    },
    {
      fullName: "Jane Premium",
      email: "jane.premium@gymdesk.local",
      phone: "+10000000011",
      photo: PLACEHOLDER_PHOTO,
      membershipStatus: "active",
      subscriptionPlanId: plans[1]._id,
      qrCode: generateQrCode(),
    },
    {
      fullName: "Bob Expired",
      email: "bob.expired@gymdesk.local",
      phone: "+10000000012",
      membershipStatus: "expired",
      subscriptionPlanId: plans[0]._id,
      qrCode: generateQrCode(),
    },
    {
      fullName: "Alice Suspended",
      email: "alice.suspended@gymdesk.local",
      phone: "+10000000013",
      membershipStatus: "suspended",
      subscriptionPlanId: plans[0]._id,
      qrCode: generateQrCode(),
    },
    {
      fullName: "Chris New",
      email: "chris.new@gymdesk.local",
      phone: "+10000000014",
      membershipStatus: "active",
      subscriptionPlanId: plans[0]._id,
      qrCode: generateQrCode(),
    },
  ]);

  const classes = await FitnessClass.insertMany([
    {
      name: "Morning HIIT",
      description: "High intensity interval training",
      trainerId: trainers[0]._id,
      schedule: [{ dayOfWeek: 1, startTime: "07:00", endTime: "08:00" }],
      capacity: 20,
      location: "Studio A",
    },
    {
      name: "Evening Yoga",
      description: "Relaxing vinyasa flow",
      trainerId: trainers[1]._id,
      schedule: [{ dayOfWeek: 3, startTime: "18:00", endTime: "19:00" }],
      capacity: 15,
      location: "Studio B",
    },
    {
      name: "Strength Basics",
      description: "Foundational barbell training",
      trainerId: trainers[0]._id,
      schedule: [{ dayOfWeek: 5, startTime: "10:00", endTime: "11:00" }],
      capacity: 12,
      location: "Weight Room",
    },
  ]);

  const now = new Date();
  const attendanceRecords = [];
  for (let i = 0; i < 10; i++) {
    const member = members[i % 2 === 0 ? 0 : 1];
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    attendanceRecords.push({
      memberId: member._id,
      checkedInAt: day,
      method: i % 3 === 0 ? "manual" : "qr",
      staffId: i % 3 === 0 ? owner._id : null,
    });
  }
  await Attendance.insertMany(attendanceRecords);

  const overduePayments = [];
  for (let i = 0; i < 3; i++) {
    const member = members[i];
    const sub = await Subscription.create({
      memberId: member._id,
      planId: plans[0]._id,
      startDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
      endDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      status: "expired",
    });
    overduePayments.push({
      memberId: member._id,
      subscriptionId: sub._id,
      amount: plans[0].price,
      method: "card",
      status: "overdue",
      dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
    });
  }
  await GymPayment.insertMany(overduePayments);

  console.log("✅ GymDesk seed complete");
  console.log(`   Owner login: owner@gymdesk.local / Password123!`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
