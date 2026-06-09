import agenda from "./agenda";

export const scheduleJob = async (
  jobName: string,
  when: string | Date,
  data?: any
) => {
  console.log(jobName, when, data);
  await agenda.schedule(when, jobName, data);
};

export const scheduleRecurringJob = async (
  jobName: string,
  interval: string,
  data?: any
) => {
  await agenda.every(interval, jobName, data);
};

export const cancelJobs = async (jobName: string) => {
  await agenda.cancel({ name: jobName });
};

export const now = async (jobName: string, data?: any) => {
  await agenda.now(jobName, data);
};
