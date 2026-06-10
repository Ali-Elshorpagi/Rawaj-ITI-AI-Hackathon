import { PlanService } from "./plan.service";
import { PlanRouter } from "./plan.router";

export class PlanModule {
  planService = new PlanService();
  planRouter = new PlanRouter(this.planService);

  routerFactory() {
    return this.planRouter.createRouter();
  }
}
