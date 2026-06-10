import { Router } from "express";
import { AttendanceController } from "./attendance.controller";
import { AttendanceService } from "./attendance.service";
import { GymAuthMiddleware, requireRole } from "../../shared/middlewares/auth";
import paginationMiddleware from "../../shared/middlewares/pagination";

const CHECKIN_ROLES = requireRole(["member", "reception", "manager", "owner"]);
const VIEW_ROLES = requireRole(["member", "reception", "manager", "owner"]);
const STAFF_ROLES = requireRole(["reception", "manager", "owner"]);
const MEMBER_ONLY = requireRole(["member"]);

export class AttendanceRouter {
  private attendanceController: AttendanceController;
  private gymAuth = new GymAuthMiddleware();

  constructor(attendanceService: AttendanceService) {
    this.attendanceController = new AttendanceController(attendanceService);
  }

  createRouter() {
    const router = Router();
    const auth = this.gymAuth.authenticate.bind(this.gymAuth);

    router.patch(
      "/:id/checkout",
      auth,
      STAFF_ROLES,
      this.attendanceController.staffCheckOut.bind(this.attendanceController)
    );
    router.post(
      "/self-checkin",
      auth,
      MEMBER_ONLY,
      this.attendanceController.selfCheckIn.bind(this.attendanceController)
    );
    router.post(
      "/self-checkout",
      auth,
      MEMBER_ONLY,
      this.attendanceController.selfCheckOut.bind(this.attendanceController)
    );
    router.get(
      "/today-status",
      auth,
      MEMBER_ONLY,
      this.attendanceController.todayStatus.bind(this.attendanceController)
    );
    router.post(
      "/checkin",
      auth,
      CHECKIN_ROLES,
      this.attendanceController.checkIn.bind(this.attendanceController)
    );
    router.post(
      "/check-in/qr",
      auth,
      CHECKIN_ROLES,
      this.attendanceController.checkInQR.bind(this.attendanceController)
    );
    router.get(
      "/today",
      auth,
      VIEW_ROLES,
      this.attendanceController.today.bind(this.attendanceController)
    );
    router.get(
      "/daily",
      auth,
      VIEW_ROLES,
      this.attendanceController.daily.bind(this.attendanceController)
    );
    router.get(
      "/monthly",
      auth,
      VIEW_ROLES,
      this.attendanceController.monthly.bind(this.attendanceController)
    );
    router.get(
      "/member/:memberId",
      auth,
      VIEW_ROLES,
      paginationMiddleware,
      this.attendanceController.memberHistory.bind(this.attendanceController)
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
