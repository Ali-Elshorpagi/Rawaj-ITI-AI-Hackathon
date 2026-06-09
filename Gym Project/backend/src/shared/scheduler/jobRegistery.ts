import agenda from "./agenda";
import { scheduleRecurringJob } from "./scheduler";
import registerCleanUpJob, {
  JOB_NAME as CLEANUP_JOB,
} from "./jobs/cleanFilesJob";
import { SUBSCRIPTION_EXPIRY_JOB } from "../../modules/notifications/jobs/subscriptionExpiryJob";
import { OVERDUE_PAYMENTS_JOB } from "../../modules/notifications/jobs/overduePaymentsJob";

export const initScheduler = async () => {
  registerCleanUpJob(agenda);

  await agenda.start();
  console.log("🚀 Agenda started");
  const existingJobs = await agenda.jobs({ name: CLEANUP_JOB });
  if (existingJobs.length === 0) {
    await scheduleRecurringJob(CLEANUP_JOB, "0 0 * * *");
    console.log("🗓️ Scheduled daily cleanup job at midnight");
  }

  const expiryJobs = await agenda.jobs({ name: SUBSCRIPTION_EXPIRY_JOB });
  if (expiryJobs.length === 0) {
    await scheduleRecurringJob(SUBSCRIPTION_EXPIRY_JOB, "0 8 * * *");
    console.log("🗓️ Scheduled gym subscription expiry notifications");
  }

  const overdueJobs = await agenda.jobs({ name: OVERDUE_PAYMENTS_JOB });
  if (overdueJobs.length === 0) {
    await scheduleRecurringJob(OVERDUE_PAYMENTS_JOB, "0 9 * * *");
    console.log("🗓️ Scheduled gym overdue payment notifications");
  }
};
