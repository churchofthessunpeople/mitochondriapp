import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatTimeInZone, getSunTimes } from "./sun";

describe("getSunTimes", () => {
  it("Dallas summer: sunrise morning, sunset evening local", () => {
    const date = new Date("2026-07-12T12:00:00Z");
    const r = getSunTimes(date, 32.78, -96.8);
    assert.ok(r.sunrise);
    assert.ok(r.sunset);
    const rise = formatTimeInZone(r.sunrise, "America/Chicago");
    const set = formatTimeInZone(r.sunset, "America/Chicago");
    assert.match(rise, /AM/i);
    assert.match(set, /PM/i);
    assert.ok((r.dayLengthHours ?? 0) > 13 && (r.dayLengthHours ?? 0) < 15);
  });

  it("does not invert with east-positive US longitudes", () => {
    const date = new Date("2026-07-12T12:00:00Z");
    const r = getSunTimes(date, 40.71, -74.0);
    const rise = formatTimeInZone(r.sunrise, "America/New_York");
    assert.match(rise, /AM/i);
  });
});
