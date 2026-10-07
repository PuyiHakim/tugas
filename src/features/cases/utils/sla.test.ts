import { describe, expect, it } from "vitest";
import { formatSla, getSlaState } from "@/features/cases/utils/sla";

const now = Date.parse("2026-10-07T12:00:00.000Z");

describe("SLA state", () => {
  it("returns none when there is no due date", () => expect(getSlaState(null, now)).toBe("none"));
  it("marks a deadline more than two hours away on track", () => expect(getSlaState("2026-10-07T14:00:01.000Z", now)).toBe("on_track"));
  it("marks the two-hour boundary due soon", () => expect(getSlaState("2026-10-07T14:00:00.000Z", now)).toBe("due_soon"));
  it("marks a past deadline breached", () => expect(getSlaState("2026-10-07T11:59:59.000Z", now)).toBe("breached"));
  it("formats an upcoming deadline with a readable label", () => expect(formatSla("2026-10-07T13:30:00.000Z", now)).toBe("Due in 1h 30m"));
});
