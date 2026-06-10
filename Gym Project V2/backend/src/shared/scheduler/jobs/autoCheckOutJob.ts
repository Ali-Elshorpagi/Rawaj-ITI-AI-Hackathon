import Agenda from "agenda";
import { AttendanceService } from "../../../modules/attendance/attendance.service";

export const AUTO_CHECKOUT_JOB = "auto_checkout";

export default (agenda: Agenda) => {
  agenda.define(AUTO_CHECKOUT_JOB, async () => {
    const attendanceService = new AttendanceService();
    await attendanceService.autoCheckOutAll();
  });
};
