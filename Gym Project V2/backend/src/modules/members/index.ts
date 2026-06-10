import { MemberService } from "./member.service";
import { MemberRouter } from "./member.router";

export class MemberModule {
  memberService = new MemberService();
  memberRouter = new MemberRouter(this.memberService);

  routerFactory() {
    return this.memberRouter.createRouter();
  }
}
