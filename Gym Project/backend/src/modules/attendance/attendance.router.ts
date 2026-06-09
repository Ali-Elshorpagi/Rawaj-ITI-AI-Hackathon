import { Router } from "express";
import { AttendanceController } from "./attendance.controller";
import { AttendanceService } from "./attendance.service";
import { GymAuthMiddleware, requireRole } from "../../shared/middlewares/auth";
import paginationMiddleware from "../../shared/middlewares/pagination";

const CHECKIN_ROLES = requireRole(["member", "reception", "manager", "owner"]);
const VIEW_ROLES = requireRole(["member", "reception", "manager", "owner"]);

export class AttendanceRouter {
  private attendanceController: AttendanceController;
  private gymAuth = new GymAuthMiddleware();

  constructor(attendanceService: AttendanceService) {
    this.attendanceController = new AttendanceController(attendanceService);
  }

  createRouter() {
    const router = Router();
    const auth = this.gymAuth.authenticate.bind(this.gymAuth);

    router.post(
      "/checkin",
      auth,
      CHECKIN_ROLES,
      this.attendanceController.checkIn.bind(this.attendanceController)
    );
    router.get(
      "/today",
      auth,
      VIEW_ROLES,
      this.attendanceController.today.bind(this.attendanceController)
    );
    router.get(
      "/",
      auth,
      VIEW_ROLES,
      paginationMiddleware,
      this.attendanceController.list.bind(this.attendanceController)
    );

    return router;
  }
}
