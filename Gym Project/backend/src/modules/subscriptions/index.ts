import { SubscriptionService } from "./subscription.service";
import { SubscriptionRouter } from "./subscription.router";

export class SubscriptionModule {
  subscriptionService = new SubscriptionService();
  subscriptionRouter = new SubscriptionRouter(this.subscriptionService);

  routerFactory() {
    return this.subscriptionRouter.createRouter();
  }
}
