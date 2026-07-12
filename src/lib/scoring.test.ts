import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { maxLogsPerDay, pointsForLog, streakBonusPoints } from "./scoring";

describe("pointsForLog", () => {
  const base = {
    points: 10,
    durationEnabled: true,
    referenceMinutes: 10,
    maxDurationMinutes: 60,
  };

  it("returns base points without duration", () => {
    assert.equal(pointsForLog(base, null), 10);
  });

  it("scales with duration", () => {
    assert.equal(pointsForLog(base, 20), 20);
  });

  it("caps at max duration", () => {
    assert.equal(pointsForLog(base, 120), 60);
  });
});

describe("maxLogsPerDay", () => {
  it("single = 1", () => {
    assert.equal(maxLogsPerDay({ allowsMultiple: false, maxPerDay: 5 }), 1);
  });
  it("multi uses maxPerDay", () => {
    assert.equal(maxLogsPerDay({ allowsMultiple: true, maxPerDay: 4 }), 4);
  });
});

describe("streakBonusPoints", () => {
  it("zero under 2 days", () => {
    assert.equal(streakBonusPoints(1), 0);
  });
  it("caps at 7", () => {
    assert.equal(streakBonusPoints(20), 7);
  });
});
