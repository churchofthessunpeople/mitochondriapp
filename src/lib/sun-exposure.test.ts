import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { SunTimes } from "@/lib/sun";
import {
  decodeSunExposureVariant,
  encodeSunExposureVariant,
  sunExposureBasePoints,
  sunExposureSlotBounds,
  sunExposureSlotClockLabel,
  sunSlotFromLocalHour,
  sunSlotFromLocalHm,
} from "@/lib/sun-exposure";

/** Fixed civil times for slot math (ignore real astronomy). */
function fakeSun(opts: {
  sunrise: string;
  solarNoon: string;
  sunset: string;
}): SunTimes {
  // Dates are only formatted via formatTimeInZone in helpers; tests that need
  // solar-relative math pass ctx.sun through solarNoonHmFromSun — use Date
  // strings that encode the intended local wall times via UTC when tz=UTC.
  const [rh, rm] = opts.sunrise.split(":").map(Number);
  const [nh, nm] = opts.solarNoon.split(":").map(Number);
  const [sh, sm] = opts.sunset.split(":").map(Number);
  return {
    sunrise: new Date(Date.UTC(2026, 6, 12, rh!, rm!, 0)),
    solarNoon: new Date(Date.UTC(2026, 6, 12, nh!, nm!, 0)),
    sunset: new Date(Date.UTC(2026, 6, 12, sh!, sm!, 0)),
    dayLengthHours: null,
  };
}

const SAMPLE = fakeSun({
  sunrise: "06:00",
  solarNoon: "13:00",
  sunset: "20:00",
});
const CTX = { sun: SAMPLE, timeZone: "UTC" };

describe("sunExposureSlotBounds", () => {
  it("places noon window 1h before to 2h after solar noon", () => {
    const b = sunExposureSlotBounds(SAMPLE, "UTC");
    assert.equal(b.solarNoonMins, 13 * 60);
    assert.equal(b.noonStartMins, 12 * 60); // 1h before
    assert.equal(b.noonEndMins, 15 * 60); // 2h after
  });
});

describe("sunSlotFromLocalHour", () => {
  it("maps sunrise → 1h before noon / noon window / to sunset", () => {
    assert.equal(sunSlotFromLocalHour(6, CTX), "morning");
    assert.equal(sunSlotFromLocalHour(9, CTX), "morning");
    assert.equal(sunSlotFromLocalHour(11, CTX), "morning");
    assert.equal(sunSlotFromLocalHour(12, CTX), "noon");
    assert.equal(sunSlotFromLocalHour(13, CTX), "noon");
    assert.equal(sunSlotFromLocalHour(14, CTX), "noon");
    assert.equal(sunSlotFromLocalHour(15, CTX), "afternoon");
    assert.equal(sunSlotFromLocalHour(17, CTX), "afternoon");
  });
});

describe("sunSlotFromLocalHm", () => {
  it("parses HH:mm against solar-relative windows", () => {
    assert.equal(sunSlotFromLocalHm("11:59", CTX), "morning");
    assert.equal(sunSlotFromLocalHm("12:00", CTX), "noon");
    assert.equal(sunSlotFromLocalHm("14:59", CTX), "noon");
    assert.equal(sunSlotFromLocalHm("15:00", CTX), "afternoon");
    assert.equal(sunSlotFromLocalHm("07:05", CTX), "morning");
  });

  it("falls back to 12:00 solar noon without sun times", () => {
    // noon window = 11:00–14:00 when solar noon defaults to 12:00
    assert.equal(sunSlotFromLocalHm("10:30"), "morning");
    assert.equal(sunSlotFromLocalHm("11:00"), "noon");
    assert.equal(sunSlotFromLocalHm("13:59"), "noon");
    assert.equal(sunSlotFromLocalHm("14:00"), "afternoon");
  });
});

describe("sunExposureSlotClockLabel", () => {
  it("shows place-relative clock ranges", () => {
    assert.equal(
      sunExposureSlotClockLabel("morning", SAMPLE, "UTC"),
      "6 am – 12 pm",
    );
    assert.equal(
      sunExposureSlotClockLabel("noon", SAMPLE, "UTC"),
      "12 pm – 3 pm",
    );
    assert.equal(
      sunExposureSlotClockLabel("afternoon", SAMPLE, "UTC"),
      "3 pm – 8 pm",
    );
  });
});

describe("encode/decode sun exposure variant", () => {
  it("round-trips slot and cover", () => {
    const packed = encodeSunExposureVariant({
      slot: "noon",
      cover: "full_sun",
    });
    assert.deepEqual(decodeSunExposureVariant(packed), {
      slot: "noon",
      cover: "full_sun",
    });
    const shaded = encodeSunExposureVariant({
      slot: "afternoon",
      cover: "shaded",
    });
    assert.deepEqual(decodeSunExposureVariant(shaded), {
      slot: "afternoon",
      cover: "shaded",
    });
  });

  it("reads slot from legacy packed values as full sun", () => {
    assert.deepEqual(decodeSunExposureVariant(20), {
      slot: "morning",
      cover: "full_sun",
    });
    assert.deepEqual(decodeSunExposureVariant(1), {
      slot: "noon",
      cover: "full_sun",
    });
  });
});

describe("sunExposureBasePoints", () => {
  it("uses full catalog base for full sun", () => {
    assert.equal(
      sunExposureBasePoints(8, { slot: "noon", cover: "full_sun" }),
      8,
    );
  });

  it("reduces points for shaded cover", () => {
    assert.equal(
      sunExposureBasePoints(8, { slot: "noon", cover: "shaded" }),
      6,
    );
  });
});
