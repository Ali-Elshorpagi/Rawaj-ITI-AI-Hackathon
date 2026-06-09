import { Request, Response, NextFunction } from "express";
import { FileService } from "./file.service";
import { InvalidCredentialsError } from "../../shared/utils/custom-errors";

export class FileController {
  private fileService: FileService;

  constructor(fileService: FileService) {
    this.fileService = fileService;
  }

  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      const user = req.user.id;
      if (!file) {
        throw new InvalidCredentialsError("File not found");
      }

      // const uploadedFile = await this.fileService.uploadImage(file, user);

      res.sendSuccess("File uploaded successfully", null, 201);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      const fileId = req.params.fileId;
      const user = req.user.id;

      await this.fileService.deleteFile(fileId, user);

      res.sendSuccess("File deleted successfully", null, 200);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
