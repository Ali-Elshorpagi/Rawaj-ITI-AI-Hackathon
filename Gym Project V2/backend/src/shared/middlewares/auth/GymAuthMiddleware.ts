import { Request, Response, NextFunction } from "express";
import { validateToken } from "../../utils/auth/tokenUtils";
import User from "../../../modules/users/user.model";
import { IUserResponseData } from "../../../modules/users/types";
import { UnauthorizedError } from "../../utils/custom-errors";
import { GymRole } from "../../constants/gym-roles";

export class GymAuthMiddleware {
  async authenticate(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req?.headers?.authorization?.split(" ")[1];
      if (!token) {
        throw new UnauthorizedError("No token provided");
      }

      const decoded = await validateToken(token);
      if (!decoded) {
        throw new UnauthorizedError("Invalid token");
      }

      const payload = decoded as { id: string; role?: GymRole };
      const userData = (await User.findById(payload.id)) as IUserResponseData;
      if (!userData) {
        throw new UnauthorizedError("User not found");
      }

      const role = payload.role ?? (userData.roles[0] as GymRole);
      if (!userData.roles.includes(role)) {
        throw new UnauthorizedError("userNotAllowed");
      }

      req.user = {
        id: payload.id,
        email: userData.email,
        name: userData.name,
        type: "gym",
        role,
        memberId: userData.memberId?.toString(),
      };
      next();
    } catch (error) {
      next(error);
    }
  }
}
