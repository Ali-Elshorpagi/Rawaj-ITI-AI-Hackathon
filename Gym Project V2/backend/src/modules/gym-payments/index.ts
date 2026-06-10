import { GymPaymentService } from "./payment.service";
import { GymPaymentRouter } from "./payment.router";

export class GymPaymentModule {
  paymentService = new GymPaymentService();
  paymentRouter = new GymPaymentRouter(this.paymentService);

  routerFactory() {
    return this.paymentRouter.createRouter();
  }
}
