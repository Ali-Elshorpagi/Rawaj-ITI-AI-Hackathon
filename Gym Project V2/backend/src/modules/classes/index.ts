import { ClassService } from "./class.service";
import { ClassRouter } from "./class.router";

export class ClassModule {
  classService = new ClassService();
  classRouter = new ClassRouter(this.classService);

  routerFactory() {
    return this.classRouter.createRouter();
  }
}
