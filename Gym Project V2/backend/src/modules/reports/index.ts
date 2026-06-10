import { ReportService } from "./report.service";
import { ReportRouter } from "./report.router";

export class ReportModule {
  reportService = new ReportService();
  reportRouter = new ReportRouter(this.reportService);

  routerFactory() {
    return this.reportRouter.createRouter();
  }
}
