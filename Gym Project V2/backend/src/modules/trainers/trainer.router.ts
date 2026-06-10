import { Router } from "express";
import { TrainerController } from "./trainer.controller";
import { TrainerService } from "./trainer.service";
import { GymAuthMiddleware, requireRole } from "../../shared/middlewares/auth";
import { optionalImageUpload } from "../../shared/middlewares/upload";

const MANAGER_OWNER = requireRole(["manager", "owner"]);
const TRAINER_READ = requireRole(["trainer", "manager", "owner"]);

export class TrainerRouter {
  private trainerController: TrainerController;
  private gymAuth = new GymAuthMiddleware();

  constructor(trainerService: TrainerService) {
    this.trainerController = new TrainerController(trainerService);
  }

  createRouter() {
    const router = Router();
    const auth = this.gymAuth.authenticate.bind(this.gymAuth);

    router.get(
      "/",
      auth,
      TRAINER_READ,
      this.trainerController.list.bind(this.trainerController)
    );
    router.post(
      "/",
      auth,
      MANAGER_OWNER,
      optionalImageUpload(["photo"]),
      this.trainerController.create.bind(this.trainerController)
    );
    router.put(
      "/:id",
      auth,
      MANAGER_OWNER,
      optionalImageUpload(["photo"]),
      this.trainerController.update.bind(this.trainerController)
    );
    router.delete(
      "/:id",
      auth,
      MANAGER_OWNER,
      this.trainerController.delete.bind(this.trainerController)
    );
    router.get(
      "/:id/schedule",
      auth,
      TRAINER_READ,
      this.trainerController.schedule.bind(this.trainerController)
    );

    return router;
  }
}
