import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPreviousWeekRange } from "@/lib/week-range";

describe("getPreviousWeekRange", () => {
  it("uses the prior Sun–Sun block before the current week", () => {
    const week = getPreviousWeekRange("America/Chicago", "2026-07-18");
    assert.equal(week.start, "2026-07-05");
    assert.equal(week.endExclusive, "2026-07-12");
    assert.match(week.label, /Sunday, July 5/);
    assert.match(week.label, /Sunday, July 12, 2026/);
  });

  it("steps back when today is Sunday", () => {
    const week = getPreviousWeekRange("UTC", "2026-07-19");
    assert.equal(week.start, "2026-07-12");
    assert.equal(week.endExclusive, "2026-07-19");
  });
});
