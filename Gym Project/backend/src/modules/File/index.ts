import { FileService } from "./file.service";
import { FileRouter } from "./file.router";

export class FileModule {
  fileService: FileService;
  fileRouter: FileRouter;

  constructor() {
    this.fileService = new FileService();
    this.fileRouter = new FileRouter(this.fileService);
  }

  routerFactory() {
    return this.fileRouter.createRouter();
  }
}
