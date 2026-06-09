import { Request, Response, NextFunction } from "express";
import { NoRouteFound } from "../utils/custom-errors";

export const noRoute = (req: Request, res: Response, next: NextFunction) => {
  console.log(req.language);
  const message = req.t("errors.noRoute");
  console.log(message);
  next(new NoRouteFound(req.t("errors.noRoute")));
};
