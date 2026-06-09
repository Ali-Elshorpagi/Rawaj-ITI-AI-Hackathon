import { AttendanceService } from "../attendance.service";

describe("AttendanceService", () => {
  const service = new AttendanceService();

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it.todo("checkIn rejects expired membership with 403");
  it.todo("checkIn accepts valid qrToken");
});
