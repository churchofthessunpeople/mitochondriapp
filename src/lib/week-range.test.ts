import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getLastSevenDaysRange } from "@/lib/week-range";

describe("getLastSevenDaysRange", () => {
  it("returns the previous 7 days ending yesterday", () => {
    const week = getLastSevenDaysRange("America/Chicago", "2026-07-18");
    assert.equal(week.start, "2026-07-11");
    assert.equal(week.endInclusive, "2026-07-17");
    assert.equal(week.endExclusive, "2026-07-18");
    assert.match(week.label, /July 11/);
    assert.match(week.label, /July 17, 2026/);
  });

  it("excludes today when today is Sunday", () => {
    const week = getLastSevenDaysRange("UTC", "2026-07-19");
    assert.equal(week.start, "2026-07-12");
    assert.equal(week.endInclusive, "2026-07-18");
    assert.equal(week.endExclusive, "2026-07-19");
  });
});
