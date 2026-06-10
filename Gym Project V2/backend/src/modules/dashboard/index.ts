import { DashboardService } from "./dashboard.service";
import { DashboardRouter } from "./dashboard.router";

export class DashboardModule {
  dashboardService = new DashboardService();
  dashboardRouter = new DashboardRouter(this.dashboardService);

  routerFactory() {
    return this.dashboardRouter.createRouter();
  }
}
