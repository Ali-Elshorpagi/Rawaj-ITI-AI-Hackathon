import { Request, Response, NextFunction } from "express";
import { MemberService } from "./member.service";

export class MemberController {
  constructor(private memberService: MemberService) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.memberService.createMember(req.body, req.language);
      res.sendSuccess("Member created", result, 201);
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.memberService.listMembers(
        req.pagination ?? { page: 1, limit: 10, skip: 0 },
        (req.query as Record<string, unknown>) ?? {}
      );
      res.sendSuccess("Members fetched", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.memberService.getMember(req.params.id);
      res.sendSuccess("Member fetched", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.memberService.updateMember(
        req.params.id,
        req.body,
        req.language
      );
      res.sendSuccess("Member updated", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.memberService.deleteMember(
        req.params.id,
        req.language
      );
      res.sendSuccess("Member deleted", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async getAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.memberService.getMemberAttendance(
        req.params.id,
        req.pagination ?? { page: 1, limit: 10, skip: 0 }
      );
      res.sendSuccess("Attendance fetched", result, 200);
    } catch (error) {
      next(error);
    }
  }

  async getSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.memberService.getMemberSubscription(req.params.id);
      res.sendSuccess("Subscription fetched", result, 200);
    } catch (error) {
      next(error);
    }
  }
}
