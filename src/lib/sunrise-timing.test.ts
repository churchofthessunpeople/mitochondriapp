import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatSunriseOffsetMinutes,
  formatSunriseSessionOffsetMinutes,
  isSunriseSessionOptimal,
  minutesBeyondOptimalWindow,
  minutesFromSunrise,
  pointsForSunriseSessionTiming,
  pointsForSunriseViewTiming,
  SUNRISE_OPTIMAL_WINDOW_MINUTES,
} from "./sunrise-timing";

describe("sunrise view timing", () => {
  const sunrise = new Date("2026-07-14T11:30:00.000Z");

  it("awards full points inside ±15 min window", () => {
    assert.equal(SUNRISE_OPTIMAL_WINDOW_MINUTES, 15);
    assert.equal(pointsForSunriseViewTiming(12, -15), 12);
    assert.equal(pointsForSunriseViewTiming(12, 0), 12);
    assert.equal(pointsForSunriseViewTiming(12, 15), 12);
  });

  it("diminishes by 1 point per minute outside the window", () => {
    assert.equal(pointsForSunriseViewTiming(12, -16), 11);
    assert.equal(pointsForSunriseViewTiming(12, 20), 7);
    assert.equal(pointsForSunriseViewTiming(12, 26), 1);
  });

  it("computes signed offset from sunrise", () => {
    const viewed = new Date(sunrise.getTime() + 10 * 60_000);
    assert.equal(minutesFromSunrise(viewed, sunrise), 10);
    assert.equal(minutesBeyondOptimalWindow(10), 0);
    assert.equal(minutesBeyondOptimalWindow(20), 5);
  });

  it("formats offset labels", () => {
    assert.match(formatSunriseOffsetMinutes(0), /optimal/);
    assert.match(formatSunriseOffsetMinutes(25), /25 min after sunrise/);
    assert.match(formatSunriseOffsetMinutes(-20), /20 min before sunrise/);
  });
});

describe("sunrise session timing", () => {
  it("awards full points when both start and end are inside ±15 min", () => {
    assert.equal(pointsForSunriseSessionTiming(12, -15, 15), 12);
    assert.equal(pointsForSunriseSessionTiming(12, -10, 5), 12);
    assert.equal(isSunriseSessionOptimal(-15, 15), true);
  });

  it("uses worst edge for penalty outside the window", () => {
    assert.equal(pointsForSunriseSessionTiming(12, -10, 20), 7);
    assert.equal(pointsForSunriseSessionTiming(12, -20, 5), 7);
    assert.equal(pointsForSunriseSessionTiming(12, -20, 25), 2);
  });

  it("falls back to single-point scoring when end is missing", () => {
    assert.equal(pointsForSunriseSessionTiming(12, 5, null), 12);
    assert.equal(pointsForSunriseSessionTiming(12, 20, null), 7);
  });

  it("formats session offset labels", () => {
    assert.match(
      formatSunriseSessionOffsetMinutes(-15, 15),
      /15 min before – 15 min after \(optimal\)/,
    );
    assert.match(
      formatSunriseSessionOffsetMinutes(5, 15),
      /5 min after – 15 min after \(optimal\)/,
    );
    assert.match(
      formatSunriseSessionOffsetMinutes(-20, 5),
      /outside optimal/,
    );
  });
});
