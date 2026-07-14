import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  pointsForSunriseKeystoneLog,
  effectiveSunriseBoostMultiplier,
  encodeSunriseEndOffset,
} from "./sunrise-keystone-points";
import {
  applySunriseSkyToMultiplier,
  applySunriseSkyToPoints,
  decodeSunriseEndOffset,
  encodeSunriseEndOffset as encodeSkyEnd,
  fullMinutesForSky,
  sunriseSkyDurationFactor,
} from "./sunrise-sky";
import { sunriseTierById } from "./scoring";

describe("sunrise sky encoding", () => {
  it("round-trips end offset and sky", () => {
    const encoded = encodeSkyEnd(-15, "cloudy");
    const decoded = decodeSunriseEndOffset(encoded);
    assert.equal(decoded.endOffset, -15);
    assert.equal(decoded.sky, "cloudy");
  });

  it("treats small values as legacy raw end offsets", () => {
    const decoded = decodeSunriseEndOffset(15);
    assert.equal(decoded.endOffset, 15);
    assert.equal(decoded.sky, "clear");
  });
});

describe("sunrise sky duration factor", () => {
  it("requires 30 min for clear skies", () => {
    assert.equal(fullMinutesForSky("clear"), 30);
    assert.equal(sunriseSkyDurationFactor(30, "clear"), 1);
    assert.equal(sunriseSkyDurationFactor(15, "clear"), 0.5);
  });

  it("requires 45 min for cloudy skies", () => {
    assert.equal(fullMinutesForSky("cloudy"), 45);
    assert.equal(sunriseSkyDurationFactor(45, "cloudy"), 1);
    assert.equal(sunriseSkyDurationFactor(30, "cloudy"), 30 / 45);
  });

  it("scales points and boost proportionally", () => {
    assert.equal(applySunriseSkyToPoints(12, 15, "clear"), 6);
    assert.equal(applySunriseSkyToMultiplier(2, 15, "clear"), 1);
    assert.equal(applySunriseSkyToPoints(12, 30, "clear"), 12);
    assert.equal(applySunriseSkyToMultiplier(2, 30, "clear"), 2);
  });
});

describe("sunrise keystone combined scoring", () => {
  const modifiers = {
    grounded: true,
    skin: "full" as const,
    sunglasses: "none" as const,
    sky: "clear" as const,
  };

  it("awards full points and boost for optimal 30 min clear session", () => {
    const encoded = encodeSunriseEndOffset(15, "clear");
    assert.equal(pointsForSunriseKeystoneLog(12, -15, encoded), 12);
    assert.equal(
      effectiveSunriseBoostMultiplier(
        sunriseTierById("horizon"),
        modifiers,
        -15,
        encoded,
      ),
      2,
    );
  });

  it("reduces points and boost for short cloudy session", () => {
    const encoded = encodeSunriseEndOffset(15, "cloudy");
    assert.equal(pointsForSunriseKeystoneLog(12, -15, encoded), 8);
    assert.equal(
      effectiveSunriseBoostMultiplier(
        sunriseTierById("horizon"),
        modifiers,
        -15,
        encoded,
      ),
      1.33,
    );
  });
});
