import assert from "node:assert/strict";
import test from "node:test";
import { computeSunPhases, UVB_MIN_ELEVATION_DEG } from "./sun-phases";
import { solarElevationDeg } from "./sun";

const FRISCO = { lat: 33.15, lng: -96.82, tz: "America/Chicago" };

test("Frisco in mid-October has a short UV-B window that closes for the year within weeks", () => {
  const phases = computeSunPhases(
    new Date("2026-10-11T17:00:00Z"),
    FRISCO.lat,
    FRISCO.lng,
    FRISCO.tz,
  );
  assert.ok(phases.uvbWindow);
  const start = new Date(phases.uvbWindow.start);
  const end = new Date(phases.uvbWindow.end);
  assert.ok(end > start);
  assert.ok(Math.abs(solarElevationDeg(start, FRISCO.lat, FRISCO.lng) - UVB_MIN_ELEVATION_DEG) < 0.1);
  assert.equal(phases.uvbSeason.kind, "ends");
  if (phases.uvbSeason.kind === "ends") {
    assert.ok(phases.uvbSeason.date >= "2026-10-15" && phases.uvbSeason.date <= "2026-10-30");
  }
  assert.ok(phases.uvaPhase && phases.uvaPhase.end === phases.uvbWindow.start);
});

test("Frisco at the winter solstice has no UV-B window and it returns in late winter", () => {
  const phases = computeSunPhases(
    new Date("2026-12-21T18:00:00Z"),
    FRISCO.lat,
    FRISCO.lng,
    FRISCO.tz,
  );
  assert.equal(phases.uvbWindow, null);
  assert.equal(phases.uvbSeason.kind, "returns");
  if (phases.uvbSeason.kind === "returns") {
    assert.ok(phases.uvbSeason.date >= "2027-02-10" && phases.uvbSeason.date <= "2027-03-01");
  }
  assert.ok(phases.uvaPhase && phases.uvaPhase.end === phases.solarNoon);
});

test("Honolulu keeps a UV-B window all year", () => {
  const phases = computeSunPhases(
    new Date("2026-12-21T22:00:00Z"),
    21.31,
    -157.86,
    "Pacific/Honolulu",
  );
  assert.ok(phases.uvbWindow);
  assert.equal(phases.uvbSeason.kind, "all-year");
});

test("sunrise window starts at sunrise and lasts 90 minutes; sunset phase is the last hour", () => {
  const phases = computeSunPhases(
    new Date("2026-06-21T17:00:00Z"),
    FRISCO.lat,
    FRISCO.lng,
    FRISCO.tz,
  );
  assert.ok(phases.sunriseWindow && phases.sunsetPhase);
  const minutes = (w: { start: string; end: string }) =>
    (new Date(w.end).getTime() - new Date(w.start).getTime()) / 60_000;
  assert.equal(minutes(phases.sunriseWindow), 90);
  assert.equal(minutes(phases.sunsetPhase), 60);
});
