import { Router } from "express";
import { ClassController } from "./class.controller";
import { ClassService } from "./class.service";
import { GymAuthMiddleware, requireRole } from "../../shared/middlewares/auth";
import { optionalImageUpload } from "../../shared/middlewares/upload";

const MANAGER_OWNER = requireRole(["manager", "owner"]);
const TRAINER_READ = requireRole(["trainer", "member", "manager", "owner"]);
const ENROLL_ROLES = requireRole(["member", "reception", "manager", "owner"]);
const ATTENDANCE_ROLES = requireRole(["trainer", "manager", "owner"]);

export class ClassRouter {
  private classController: ClassController;
  private gymAuth = new GymAuthMiddleware();

  constructor(classService: ClassService) {
    this.classController = new ClassController(classService);
  }

  createRouter() {
    const router = Router();
    const auth = this.gymAuth.authenticate.bind(this.gymAuth);

    router.get("/", this.classController.list.bind(this.classController));
    router.post(
      "/",
      auth,
      MANAGER_OWNER,
      optionalImageUpload(["coverImage"]),
      this.classController.create.bind(this.classController)
    );
    router.put(
      "/:id",
      auth,
      MANAGER_OWNER,
      optionalImageUpload(["coverImage"]),
      this.classController.update.bind(this.classController)
    );
    router.delete(
      "/:id",
      auth,
      MANAGER_OWNER,
      this.classController.delete.bind(this.classController)
    );
    router.post(
      "/:id/enroll",
      auth,
      ENROLL_ROLES,
      this.classController.enroll.bind(this.classController)
    );
    router.get(
      "/:id/participants",
      auth,
      TRAINER_READ,
      this.classController.participants.bind(this.classController)
    );
    router.post(
      "/:id/attendance",
      auth,
      ATTENDANCE_ROLES,
      this.classController.attendance.bind(this.classController)
    );

    return router;
  }
}
