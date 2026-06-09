import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../../utils/custom-errors";
import { GymRole } from "../../constants/gym-roles";

export const requireRole =
  (allowedRoles: GymRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const role = req.user?.role;
      if (!role || !allowedRoles.includes(role as GymRole)) {
        throw new UnauthorizedError("userNotAllowed");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
