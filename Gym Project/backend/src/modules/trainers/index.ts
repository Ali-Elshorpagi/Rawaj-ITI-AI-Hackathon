import { TrainerService } from "./trainer.service";
import { TrainerRouter } from "./trainer.router";

export class TrainerModule {
  trainerService = new TrainerService();
  trainerRouter = new TrainerRouter(this.trainerService);

  routerFactory() {
    return this.trainerRouter.createRouter();
  }
}
