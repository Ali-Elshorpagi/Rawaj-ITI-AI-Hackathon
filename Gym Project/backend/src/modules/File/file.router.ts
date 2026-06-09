import { Router } from "express";
import { FileService } from "./file.service";
import { FileController } from "./file.controller";
import {
  processImagesMiddleware,
  upload,
} from "../../shared/middlewares/upload";
import { GymAuthMiddleware } from "../../shared/middlewares/auth";

export class FileRouter {
  private fileService: FileService;
  private fileController: FileController;
  private gymAuthMiddleware = new GymAuthMiddleware();

  constructor(fileService: FileService) {
    this.fileService = fileService;
    this.fileController = new FileController(this.fileService);
  }

  createRouter() {
    const router = Router();
    const auth = this.gymAuthMiddleware.authenticate.bind(this.gymAuthMiddleware);

    router.post(
      "/test-cloudinary",
      auth,
      upload.fields([
        { name: "mainImage", maxCount: 1 },
        { name: "images", maxCount: 6 },
      ]),
      processImagesMiddleware(["mainImage", "images"]),
      async (req, res) => {
        res.send(req.body);
      }
    );

    router.delete(
      "/delete-image/:fileId",
      auth,
      this.fileController.deleteFile.bind(this.fileController)
    );

    return router;
  }
}
