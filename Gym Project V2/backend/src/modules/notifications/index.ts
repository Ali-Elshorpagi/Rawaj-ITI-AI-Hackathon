import { NotificationService } from "./notification.service";
import { NotificationRouter } from "./notification.router";
import agenda from "../../shared/scheduler/agenda";
import registerSubscriptionExpiryJob from "./jobs/subscriptionExpiryJob";
import registerOverduePaymentsJob from "./jobs/overduePaymentsJob";

export class NotificationModule {
  notificationService: NotificationService;
  private notificationRouter: NotificationRouter;

  constructor() {
    this.notificationService = new NotificationService();
    this.notificationRouter = new NotificationRouter(this.notificationService);
    registerSubscriptionExpiryJob(agenda);
    registerOverduePaymentsJob(agenda);
  }

  routerFactory() {
    return this.notificationRouter.createRouter();
  }
}
