import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { connectDatabase } from "../shared/database/connect";
import { config } from "../shared/config";
import SubscriptionPlan from "../modules/plans/subscriptionPlan.model";
import Member from "../modules/members/member.model";
import Trainer from "../modules/trainers/trainer.model";
import FitnessClass from "../modules/classes/fitnessClass.model";
import ClassEnrollment from "../modules/classes/classEnrollment.model";
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
    ClassEnrollment.deleteMany({}),
    Attendance.deleteMany({}),
    GymPayment.deleteMany({}),
    Subscription.deleteMany({}),
    User.deleteMany({ roles: { $in: ["trainer", "reception", "owner", "manager"] } }),
  ]);

  const plans = await SubscriptionPlan.insertMany([
    {
      name: "Basic Monthly",
      durationMonths: 1,
      price: 49.99,
      currency: "USD",
      description: "Access to gym floor and cardio equipment",
      color: "#3b82f6",
      isActive: true,
    },
    {
      name: "Premium Annual",
      durationMonths: 12,
      price: 499.99,
      currency: "USD",
      description: "Full access including classes and personal training discount",
      color: "#0D9488",
      isActive: true,
    },
    {
      name: "Semi-Annual",
      durationMonths: 6,
      price: 279.99,
      currency: "USD",
      description: "6-month access to all facilities",
      color: "#8b5cf6",
      isActive: true,
    },
  ]);

  const password = await bcrypt.hash("Password123!", config.bcrypt.saltRounds);

  // ── Staff accounts ──────────────────────────────────────────────────────────
  const owner = await User.create({
    name: "Gym Owner",
    email: "owner@gymdesk.local",
    phone: "+10000000001",
    password,
    roles: ["owner"],
    isVerified: true,
  });

  await User.create({
    name: "Gym Manager",
    email: "manager@gymdesk.local",
    phone: "+10000000005",
    password,
    roles: ["manager"],
    isVerified: true,
  });

  const staffUsers = await User.insertMany([
    { name: "Alex Trainer",    email: "alex@gymdesk.local",       phone: "+10000000002", password, roles: ["trainer"],   isVerified: true },
    { name: "Sam Coach",       email: "sam@gymdesk.local",        phone: "+10000000003", password, roles: ["trainer"],   isVerified: true },
    { name: "Reception Staff", email: "reception@gymdesk.local",  phone: "+10000000004", password, roles: ["reception"], isVerified: true },
  ]);

  const trainers = await Trainer.insertMany([
    {
      userId: staffUsers[0]._id,
      specialization: "Strength & Conditioning",
      bio: "Certified personal trainer with 8 years experience",
      photo: PLACEHOLDER_PHOTO,
    },
    {
      userId: staffUsers[1]._id,
      specialization: "Yoga & Flexibility",
      bio: "RYT-500 yoga instructor",
      photo: PLACEHOLDER_PHOTO,
    },
  ]);

  // ── Members ─────────────────────────────────────────────────────────────────
  const members = await Member.insertMany([
    { fullName: "John Active",    email: "john.active@gymdesk.local",    phone: "+10000000010", photo: PLACEHOLDER_PHOTO, membershipStatus: "active",    subscriptionPlanId: plans[0]._id, qrCode: generateQrCode() },
    { fullName: "Jane Premium",   email: "jane.premium@gymdesk.local",   phone: "+10000000011", photo: PLACEHOLDER_PHOTO, membershipStatus: "active",    subscriptionPlanId: plans[1]._id, qrCode: generateQrCode() },
    { fullName: "Bob Expired",    email: "bob.expired@gymdesk.local",    phone: "+10000000012", membershipStatus: "expired",   subscriptionPlanId: plans[0]._id, qrCode: generateQrCode() },
    { fullName: "Alice Suspended",email: "alice.suspended@gymdesk.local",phone: "+10000000013", membershipStatus: "suspended", subscriptionPlanId: plans[0]._id, qrCode: generateQrCode() },
    { fullName: "Chris Active",   email: "chris.new@gymdesk.local",      phone: "+10000000014", membershipStatus: "active",    subscriptionPlanId: plans[2]._id, qrCode: generateQrCode() },
    { fullName: "Diana Active",   email: "diana.active@gymdesk.local",   phone: "+10000000015", photo: PLACEHOLDER_PHOTO, membershipStatus: "active",    subscriptionPlanId: plans[1]._id, qrCode: generateQrCode() },
    { fullName: "Eve Basic",      email: "eve.basic@gymdesk.local",      phone: "+10000000016", membershipStatus: "active",    subscriptionPlanId: plans[0]._id, qrCode: generateQrCode() },
  ]);

  // ── Classes ──────────────────────────────────────────────────────────────────
  const classes = await FitnessClass.insertMany([
    {
      name: "Morning HIIT",
      description: "High intensity interval training",
      trainerId: trainers[0]._id,
      schedule: [
        { dayOfWeek: 1, startTime: "07:00", endTime: "08:00" },
        { dayOfWeek: 3, startTime: "07:00", endTime: "08:00" },
        { dayOfWeek: 5, startTime: "07:00", endTime: "08:00" },
      ],
      capacity: 20,
      location: "Studio A",
      coverImage: PLACEHOLDER_PHOTO,
    },
    {
      name: "Evening Yoga",
      description: "Relaxing vinyasa flow",
      trainerId: trainers[1]._id,
      schedule: [
        { dayOfWeek: 2, startTime: "18:00", endTime: "19:00" },
        { dayOfWeek: 4, startTime: "18:00", endTime: "19:00" },
      ],
      capacity: 15,
      location: "Studio B",
      coverImage: PLACEHOLDER_PHOTO,
    },
    {
      name: "Strength Basics",
      description: "Foundational barbell training",
      trainerId: trainers[0]._id,
      schedule: [
        { dayOfWeek: 2, startTime: "10:00", endTime: "11:00" },
        { dayOfWeek: 6, startTime: "10:00", endTime: "11:00" },
      ],
      capacity: 12,
      location: "Weight Room",
      coverImage: PLACEHOLDER_PHOTO,
    },
    {
      name: "Pilates Core",
      description: "Core strength and flexibility",
      trainerId: trainers[1]._id,
      schedule: [
        { dayOfWeek: 1, startTime: "09:00", endTime: "10:00" },
        { dayOfWeek: 5, startTime: "09:00", endTime: "10:00" },
      ],
      capacity: 10,
      location: "Studio B",
      coverImage: PLACEHOLDER_PHOTO,
    },
  ]);

  // ── Enrollments ──────────────────────────────────────────────────────────────
  const enrollments = [
    { classId: classes[0]._id, memberId: members[0]._id },
    { classId: classes[0]._id, memberId: members[1]._id },
    { classId: classes[0]._id, memberId: members[4]._id },
    { classId: classes[1]._id, memberId: members[1]._id },
    { classId: classes[1]._id, memberId: members[5]._id },
    { classId: classes[2]._id, memberId: members[0]._id },
    { classId: classes[2]._id, memberId: members[4]._id },
    { classId: classes[3]._id, memberId: members[5]._id },
    { classId: classes[3]._id, memberId: members[6]._id },
  ];
  await ClassEnrollment.insertMany(enrollments);

  // ── Subscriptions ────────────────────────────────────────────────────────────
  const now = new Date();
  const subscriptions = await Subscription.insertMany([
    {
      memberId: members[0]._id, planId: plans[0]._id,
      startDate: new Date(now.getFullYear(), now.getMonth() - 0, 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      status: "active", paymentId: null,
    },
    {
      memberId: members[1]._id, planId: plans[1]._id,
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      endDate: new Date(now.getFullYear() + 1, now.getMonth() - 1, 1),
      status: "active", paymentId: null,
    },
    {
      memberId: members[4]._id, planId: plans[2]._id,
      startDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 4, 1),
      status: "active", paymentId: null,
    },
    {
      memberId: members[5]._id, planId: plans[1]._id,
      startDate: new Date(now.getFullYear(), now.getMonth() - 3, 1),
      endDate: new Date(now.getFullYear() + 1, now.getMonth() - 3, 1),
      status: "active", paymentId: null,
    },
    {
      memberId: members[6]._id, planId: plans[0]._id,
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      status: "active", paymentId: null,
    },
    {
      memberId: members[2]._id, planId: plans[0]._id,
      startDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
      endDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      status: "expired", paymentId: null,
    },
  ]);

  // ── Payments ──────────────────────────────────────────────────────────────────
  await GymPayment.insertMany([
    { memberId: members[0]._id, subscriptionId: subscriptions[0]._id, amount: plans[0].price, method: "card",   status: "paid",    dueDate: new Date(now.getFullYear(), now.getMonth(), 1),      paidAt: new Date(now.getFullYear(), now.getMonth(), 1) },
    { memberId: members[1]._id, subscriptionId: subscriptions[1]._id, amount: plans[1].price, method: "online", status: "paid",    dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 5),  paidAt: new Date(now.getFullYear(), now.getMonth() - 1, 5) },
    { memberId: members[4]._id, subscriptionId: subscriptions[2]._id, amount: plans[2].price, method: "cash",   status: "paid",    dueDate: new Date(now.getFullYear(), now.getMonth() - 2, 3),  paidAt: new Date(now.getFullYear(), now.getMonth() - 2, 3) },
    { memberId: members[5]._id, subscriptionId: subscriptions[3]._id, amount: plans[1].price, method: "card",   status: "paid",    dueDate: new Date(now.getFullYear(), now.getMonth() - 3, 8),  paidAt: new Date(now.getFullYear(), now.getMonth() - 3, 8) },
    { memberId: members[6]._id, subscriptionId: subscriptions[4]._id, amount: plans[0].price, method: "cash",   status: "paid",    dueDate: new Date(now.getFullYear(), now.getMonth(), 2),       paidAt: new Date(now.getFullYear(), now.getMonth(), 2) },
    { memberId: members[2]._id, subscriptionId: subscriptions[5]._id, amount: plans[0].price, method: "card",   status: "overdue", dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 15) },
    { memberId: members[3]._id, subscriptionId: null,                 amount: plans[0].price, method: "card",   status: "overdue", dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 15) },
  ]);

  // ── Attendance (last 14 days + today for "Currently Inside") ─────────────────
  const attendanceRecords = [];
  const activeMembers = [members[0], members[1], members[4], members[5], members[6]];

  for (let i = 13; i >= 1; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    day.setHours(9, 0, 0, 0);
    const checkoutDay = new Date(day);
    checkoutDay.setHours(10, 30, 0, 0);

    const dayMems = activeMembers.slice(0, i % 3 === 0 ? 3 : 2);
    for (const member of dayMems) {
      attendanceRecords.push({
        memberId: member._id,
        checkedInAt: day,
        checkedOutAt: checkoutDay,
        method: i % 2 === 0 ? "qr" : "manual",
        staffId: owner._id,
      });
    }
  }

  // Today's check-ins (no checkout yet — "Currently Inside")
  const todayCheckin = new Date();
  todayCheckin.setHours(8, 30, 0, 0);
  attendanceRecords.push(
    { memberId: members[0]._id, checkedInAt: todayCheckin, checkedOutAt: null, method: "qr",    staffId: staffUsers[2]._id },
    { memberId: members[1]._id, checkedInAt: new Date(todayCheckin.getTime() + 20*60000), checkedOutAt: null, method: "manual", staffId: staffUsers[2]._id },
  );

  await Attendance.insertMany(attendanceRecords);

  console.log("✅ GymDesk seed complete");
  console.log("   owner@gymdesk.local     / Password123!");
  console.log("   manager@gymdesk.local   / Password123!");
  console.log("   alex@gymdesk.local      / Password123!  (trainer)");
  console.log("   sam@gymdesk.local       / Password123!  (trainer)");
  console.log("   reception@gymdesk.local / Password123!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
