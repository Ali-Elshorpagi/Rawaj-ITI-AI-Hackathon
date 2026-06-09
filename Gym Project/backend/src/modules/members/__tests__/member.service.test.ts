import { MemberService } from "../member.service";

describe("MemberService", () => {
  const service = new MemberService();

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it.todo("createMember generates qrCode and stores photo url");
  it.todo("listMembers filters by status and paginates");
  it.todo("deleteMember soft-deletes and removes cloudinary photo");
});
