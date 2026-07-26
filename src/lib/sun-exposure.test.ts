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
  it("places peak-sun window ±1.5h around solar noon", () => {
    const b = sunExposureSlotBounds(SAMPLE, "UTC");
    assert.equal(b.solarNoonMins, 13 * 60);
    assert.equal(b.noonStartMins, 13 * 60 - 90); // 11:30
    assert.equal(b.noonEndMins, 13 * 60 + 90); // 14:30
  });
});

describe("sunSlotFromLocalHour", () => {
  it("maps sunrise → peak window → sunset", () => {
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
  it("parses HH:mm against symmetrical UVB windows", () => {
    assert.equal(sunSlotFromLocalHm("11:29", CTX), "morning");
    assert.equal(sunSlotFromLocalHm("11:30", CTX), "noon");
    assert.equal(sunSlotFromLocalHm("14:29", CTX), "noon");
    assert.equal(sunSlotFromLocalHm("14:30", CTX), "afternoon");
    assert.equal(sunSlotFromLocalHm("07:05", CTX), "morning");
  });

  it("falls back to 12:00 solar noon without sun times", () => {
    // noon window = 10:30–13:30 when solar noon defaults to 12:00
    assert.equal(sunSlotFromLocalHm("10:29"), "morning");
    assert.equal(sunSlotFromLocalHm("10:30"), "noon");
    assert.equal(sunSlotFromLocalHm("13:29"), "noon");
    assert.equal(sunSlotFromLocalHm("13:30"), "afternoon");
  });
});

describe("sunExposureSlotClockLabel", () => {
  it("shows place-relative clock ranges", () => {
    assert.equal(
      sunExposureSlotClockLabel("morning", SAMPLE, "UTC"),
      "6 am – 11:30 am",
    );
    assert.equal(
      sunExposureSlotClockLabel("noon", SAMPLE, "UTC"),
      "11:30 am – 2:30 pm",
    );
    assert.equal(
      sunExposureSlotClockLabel("afternoon", SAMPLE, "UTC"),
      "2:30 pm – 8 pm",
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
