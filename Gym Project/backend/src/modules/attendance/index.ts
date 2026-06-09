import { AttendanceService } from "./attendance.service";
import { AttendanceRouter } from "./attendance.router";

export class AttendanceModule {
  attendanceService = new AttendanceService();
  attendanceRouter = new AttendanceRouter(this.attendanceService);

  routerFactory() {
    return this.attendanceRouter.createRouter();
  }
}
