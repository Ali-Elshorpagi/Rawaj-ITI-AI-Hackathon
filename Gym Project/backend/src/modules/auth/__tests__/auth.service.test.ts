import { AuthService } from "../auth.service";
import { MailerService } from "../../../shared/utils/email-system/mailer";

describe("AuthService", () => {
  const service = new AuthService(new MailerService());

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it.todo("login returns JWT with role claim");
  it.todo("register creates user with gym role");
});
