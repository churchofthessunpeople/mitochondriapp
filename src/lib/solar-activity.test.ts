import assert from "node:assert/strict";
import test from "node:test";
import {
  flareClassToFlux,
  kpLabel,
  parseFlares,
  parseKp,
  radioBlackoutLevel,
  summarizeSolarActivity,
} from "./solar-activity";
import { isSunlitAt } from "./sun";

const NOW = new Date("2026-10-11T12:00:00Z");

function flareRow(maxClass: string, maxTime: string, endTime: string | null = maxTime) {
  return {
    begin_time: maxTime,
    max_time: maxTime,
    end_time: endTime,
    max_class: maxClass,
    max_xrlong: flareClassToFlux(maxClass),
  };
}

test("converts GOES flare classes to peak flux", () => {
  assert.equal(flareClassToFlux("C1.0"), 1e-6);
  assert.equal(flareClassToFlux("M5"), 5e-5);
  assert.equal(flareClassToFlux("x2.1"), 2.1e-4);
  assert.equal(flareClassToFlux("Z1"), null);
});

test("maps flux to NOAA radio blackout scale", () => {
  assert.equal(radioBlackoutLevel(9e-6), null);
  assert.equal(radioBlackoutLevel(1e-5)?.scale, "R1");
  assert.equal(radioBlackoutLevel(5e-5)?.scale, "R2");
  assert.equal(radioBlackoutLevel(1e-4)?.scale, "R3");
  assert.equal(radioBlackoutLevel(2e-3)?.scale, "R5");
});

test("alerts on an X-class flare within the past 24 hours", () => {
  const activity = summarizeSolarActivity({
    flares: parseFlares([
      flareRow("M3.0", "2026-10-11T02:00:00Z"),
      flareRow("X1.4", "2026-10-11T06:00:00Z"),
    ]),
    kp: [],
    now: NOW,
  });

  assert.equal(activity.alertFlare?.flareClass, "X1.4");
  assert.equal(activity.largestFlare24h?.flareClass, "X1.4");
  assert.equal(activity.significantFlareCount7d, 2);
});

test("does not alert on M-class or older X-class flares", () => {
  const activity = summarizeSolarActivity({
    flares: parseFlares([
      flareRow("X2.0", "2026-10-09T12:00:00Z"),
      flareRow("M9.9", "2026-10-11T08:00:00Z"),
      flareRow("C4.0", "2026-10-01T08:00:00Z"),
    ]),
    kp: [],
    now: NOW,
  });

  assert.equal(activity.alertFlare, null);
  assert.equal(activity.largestFlare24h?.flareClass, "M9.9");
  assert.equal(activity.largestFlare7d?.flareClass, "X2.0");
  assert.equal(activity.significantFlareCount7d, 2);
});

test("merges an ongoing flare from the latest feed with the 7-day list", () => {
  const activity = summarizeSolarActivity({
    flares: [
      ...parseFlares([flareRow("C2.0", "2026-10-11T10:00:00Z")]),
      ...parseFlares([flareRow("X1.0", "2026-10-11T11:30:00Z", null)]),
    ],
    kp: [],
    now: NOW,
  });

  assert.equal(activity.alertFlare?.flareClass, "X1.0");
  assert.equal(activity.alertFlare?.ongoing, true);
});

test("parses both SWPC Kp row formats", () => {
  const fromObjects = parseKp([
    { time_tag: "2026-10-11T06:00:00", Kp: 5.33 },
    { time_tag: "2026-10-11T09:00:00", Kp: 3.0 },
  ]);
  const fromArrays = parseKp([
    ["time_tag", "Kp", "a_running", "station_count"],
    ["2026-10-11 09:00:00.000", "4.67", "39", "8"],
  ]);

  assert.equal(fromObjects.at(-1)?.value, 3);
  assert.equal(fromArrays.length, 1);
  assert.equal(fromArrays[0].value, 4.67);

  const activity = summarizeSolarActivity({ flares: [], kp: fromObjects, now: NOW });
  assert.equal(activity.kp?.value, 3);
  assert.equal(activity.maxKp24h, 5.33);
  assert.equal(kpLabel(5.33), "G1 minor storm");
  assert.equal(kpLabel(3), "Quiet");
});

test("detects whether a location was in daylight", () => {
  assert.equal(isSunlitAt(new Date("2026-06-21T18:30:00Z"), 32.78, -96.8), true);
  assert.equal(isSunlitAt(new Date("2026-06-21T07:00:00Z"), 32.78, -96.8), false);
});
