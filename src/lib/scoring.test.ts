import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isSunriseProtocol,
  maxLogsPerDay,
  pointsForLog,
  streakBonusPoints,
  SUNRISE_MULTIPLIER,
} from "./scoring";

const morning = {
  points: 10,
  durationEnabled: true,
  referenceMinutes: 10,
  maxDurationMinutes: 60,
  timeOfDay: "morning" as const,
  lockedTimeOfDay: null as null,
};

const sunrise = {
  points: 10,
  durationEnabled: false,
  referenceMinutes: 10,
  maxDurationMinutes: 60,
  timeOfDay: "sunrise" as const,
  lockedTimeOfDay: "sunrise" as const,
};

describe("pointsForLog", () => {
  it("returns base points without duration", () => {
    assert.equal(pointsForLog(morning, null), 10);
  });

  it("scales with duration", () => {
    assert.equal(pointsForLog(morning, 20), 20);
  });

  it("caps at max duration", () => {
    assert.equal(pointsForLog(morning, 120), 60);
  });

  it("applies 1.5× to non-sunrise when buff active", () => {
    assert.equal(
      pointsForLog(morning, null, { sunriseBuffActive: true }),
      Math.round(10 * SUNRISE_MULTIPLIER),
    );
  });

  it("does not multiply sunrise itself", () => {
    assert.equal(
      pointsForLog(sunrise, null, { sunriseBuffActive: true }),
      10,
    );
  });
});

describe("isSunriseProtocol", () => {
  it("detects locked sunrise", () => {
    assert.equal(isSunriseProtocol(sunrise), true);
    assert.equal(isSunriseProtocol(morning), false);
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
