import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DURATION_BLOCK_MINUTES,
  bestSunriseTier,
  computeSunriseMultiplier,
  formatSunriseMultiplier,
  isSunriseKeystoneProtocol,
  isSunriseProtocol,
  maxLogsPerDay,
  pointsForLog,
  streakBonusPoints,
  sunriseTierById,
  sunriseTierForProtocolId,
} from "./scoring";

const morning = {
  id: "morning-natural-light",
  points: 10,
  durationEnabled: true,
  referenceMinutes: 15,
  maxDurationMinutes: 60,
  timeOfDay: "morning" as const,
  lockedTimeOfDay: null as null,
};

const sunriseHorizon = {
  id: "sunrise-horizon",
  points: 12,
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

  it("awards points per 15-minute block", () => {
    assert.equal(pointsForLog(morning, 15), 10);
    assert.equal(pointsForLog(morning, 30), 20);
  });

  it("caps at max duration", () => {
    assert.equal(pointsForLog(morning, 120), 40);
  });

  it("applies tier multiplier to non-keystone when set", () => {
    assert.equal(
      pointsForLog(morning, null, { sunriseMultiplier: 2 }),
      20,
    );
    assert.equal(
      pointsForLog(morning, null, { sunriseMultiplier: 1.25 }),
      Math.round(10 * 1.25),
    );
  });

  it("does not multiply keystone sunrise itself", () => {
    assert.equal(
      pointsForLog(sunriseHorizon, null, { sunriseMultiplier: 2 }),
      12,
    );
  });
});

describe("sunrise tiers", () => {
  it("maps protocols to tiers", () => {
    assert.equal(sunriseTierForProtocolId("sunrise-horizon")?.multiplier, 2);
    assert.equal(sunriseTierForProtocolId("sunrise-open-sky")?.multiplier, 1.5);
    assert.equal(sunriseTierForProtocolId("sunrise-outside")?.multiplier, 1.25);
    assert.equal(sunriseTierForProtocolId("sunrise-grounding")?.multiplier, 2);
  });

  it("picks best of day", () => {
    const best = bestSunriseTier([
      "sunrise-outside",
      "sunrise-horizon",
      "sunrise-open-sky",
    ]);
    assert.equal(best?.id, "horizon");
    assert.equal(best?.multiplier, 2);
  });

  it("formats multipliers", () => {
    assert.equal(formatSunriseMultiplier(2), "2×");
    assert.equal(formatSunriseMultiplier(1.5), "1.5×");
  });

  it("applies modifier penalties from tier max", () => {
    const horizon = sunriseTierById("horizon");
    const ideal = {
      grounded: true,
      skin: "full" as const,
      sunglasses: "none" as const,
    };
    assert.equal(computeSunriseMultiplier(horizon, ideal), 2);
    assert.equal(
      computeSunriseMultiplier(horizon, { ...ideal, sunglasses: "worn" }),
      1.5,
    );
    assert.equal(
      computeSunriseMultiplier(horizon, {
        ...ideal,
        skin: "partial",
        grounded: false,
      }),
      1.5,
    );
    assert.equal(
      computeSunriseMultiplier(sunriseTierById("open_sky"), ideal),
      1.5,
    );
  });
});

describe("isSunriseKeystoneProtocol", () => {
  it("only named keystones", () => {
    assert.equal(isSunriseKeystoneProtocol(sunriseHorizon), true);
    assert.equal(isSunriseKeystoneProtocol(morning), false);
    assert.equal(
      isSunriseKeystoneProtocol({ id: "barefoot-earth" }),
      false,
    );
  });
});

describe("isSunriseProtocol", () => {
  it("detects locked sunrise", () => {
    assert.equal(isSunriseProtocol(sunriseHorizon), true);
    assert.equal(isSunriseProtocol(morning), false);
  });
});

describe("maxLogsPerDay", () => {
  it("single = 1", () => {
    assert.equal(maxLogsPerDay({ allowsMultiple: false, maxPerDay: 5 }), 1);
  });
  it("multi is uncapped", () => {
    assert.equal(
      maxLogsPerDay({ allowsMultiple: true, maxPerDay: 4 }),
      Number.MAX_SAFE_INTEGER,
    );
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
