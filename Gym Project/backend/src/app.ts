import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";

import { FileModule } from "./modules/File";
import { NotificationModule } from "./modules/notifications";
import { AuthModule } from "./modules/auth";
import { MemberModule } from "./modules/members";
import { PlanModule } from "./modules/plans";
import { SubscriptionModule } from "./modules/subscriptions";
import { GymPaymentModule } from "./modules/gym-payments";
import { AttendanceModule } from "./modules/attendance";
import { TrainerModule } from "./modules/trainers";
import { ClassModule } from "./modules/classes";
import { ReportModule } from "./modules/reports";

import { MailerService } from "./shared/utils/email-system/mailer";
import { connectDatabase } from "./shared/database/connect";
import { errorHandler } from "./shared/middlewares/errorHandler";
import { noRoute } from "./shared/middlewares/noRoute";
import { successMiddleware } from "./shared/middlewares/successResponse";
import { languageMiddleware } from "./shared/middlewares/languageCheck";
import { i18nMiddleware } from "./shared/middlewares/i18n";
import { initScheduler } from "./shared/scheduler";
import logger from "./shared/utils/logger";
import { setupSwagger } from "./swagger/setupSwagger";

const appFactory = () => {
  const app: Application = express();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(morgan("dev"));

  app.use(
    cors({
      origin: (_origin, callback) => callback(null, true),
      credentials: true,
    })
  );

  app.use("/uploads", express.static("uploads"));
  app.use(successMiddleware);
  app.use(languageMiddleware);
  app.use(i18nMiddleware);

  setupSwagger(app);

  app.post("/api/health", (req, res) => {
    res.sendSuccess("Server is running", req.body, 200);
  });

  connectDatabase()
    .then(() => logger.info("Database connected successfully"))
    .catch((error) => {
      logger.error(`Database connection failed: ${error.message}`);
      process.exit(1);
    });

  const fileModule = new FileModule();
  app.use("/api/files", fileModule.routerFactory());

  const mailerService = new MailerService();
  const authModule = new AuthModule(mailerService);
  app.use("/api/auth", authModule.routerFactory());

  const memberModule = new MemberModule();
  app.use("/api/members", memberModule.routerFactory());

  const planModule = new PlanModule();
  app.use("/api/plans", planModule.routerFactory());

  const subscriptionModule = new SubscriptionModule();
  app.use("/api/subscriptions", subscriptionModule.routerFactory());

  const gymPaymentModule = new GymPaymentModule();
  app.use("/api/payments", gymPaymentModule.routerFactory());

  const attendanceModule = new AttendanceModule();
  app.use("/api/attendance", attendanceModule.routerFactory());

  const trainerModule = new TrainerModule();
  app.use("/api/trainers", trainerModule.routerFactory());

  const classModule = new ClassModule();
  app.use("/api/classes", classModule.routerFactory());

  const notificationModule = new NotificationModule();
  app.use("/api/notifications", notificationModule.routerFactory());

  const reportModule = new ReportModule();
  app.use("/api/reports", reportModule.routerFactory());

  app.use("*", noRoute);
  app.use(errorHandler);

  (async () => {
    await initScheduler();
  })();

  return app;
};

export default appFactory;
