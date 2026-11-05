import assert from "node:assert/strict";
import test from "node:test";
import { clearSkyUvIndex, computeSunPhases, sunNow, UVB_MIN_ELEVATION_DEG } from "./sun-phases";
import { solarElevationDeg } from "./sun";
import { summarizeUvDay, uvCategory, type UvForecast } from "./uv-forecast";

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

test("midnight-sun ZIP (Kotzebue, June) still gets a UV-B window and a consistent season", () => {
  const kotz = { lat: 66.9, lng: -162.6, tz: "America/Anchorage" };
  const phases = computeSunPhases(new Date("2026-06-21T20:00:00Z"), kotz.lat, kotz.lng, kotz.tz);
  assert.ok(phases.uvbWindow, "UV-B window should exist when noon sun is above 45 degrees");
  const start = new Date(phases.uvbWindow.start);
  const end = new Date(phases.uvbWindow.end);
  assert.ok(Math.abs(solarElevationDeg(start, kotz.lat, kotz.lng) - UVB_MIN_ELEVATION_DEG) < 0.1);
  assert.ok(Math.abs(solarElevationDeg(end, kotz.lat, kotz.lng) - UVB_MIN_ELEVATION_DEG) < 0.1);
  assert.equal(phases.uvbSeason.kind, "ends");
  assert.ok(phases.uvaPhase, "UV-A phase should fall back to a low-sun start");
});

test("sunNow reports the right phase and UV index through a Frisco summer day", () => {
  const at = (iso: string) => new Date(iso);
  const phases = computeSunPhases(at("2026-06-21T17:00:00Z"), FRISCO.lat, FRISCO.lng, FRISCO.tz);
  const now = (iso: string) => sunNow(phases, at(iso), FRISCO.lat, FRISCO.lng);
  assert.equal(now("2026-06-21T09:00:00Z").phase, "night"); // 4 AM CDT
  assert.equal(now("2026-06-21T11:45:00Z").phase, "sunrise"); // 6:45 AM CDT
  assert.equal(now("2026-06-21T14:00:00Z").phase, "uva"); // 9 AM CDT
  const noon = now("2026-06-21T17:30:00Z"); // 12:30 PM CDT
  assert.equal(noon.phase, "uvb");
  assert.ok(noon.uvIndex > 9 && noon.uvIndex < 13, `noon UVI ${noon.uvIndex}`);
  assert.ok(noon.until);
  assert.equal(now("2026-06-21T23:30:00Z").phase, "daylight"); // 6:30 PM CDT
  assert.equal(now("2026-06-22T01:30:00Z").phase, "sunset"); // 8:30 PM CDT
  assert.equal(now("2026-06-22T04:00:00Z").phase, "night");
  assert.equal(now("2026-06-22T04:00:00Z").uvIndex, 0);
});

test("UV index estimate is zero at night and about 5 at 45 degrees", () => {
  assert.equal(clearSkyUvIndex(-10), 0);
  const v = clearSkyUvIndex(45);
  assert.ok(v > 4.5 && v < 6, `UVI at 45deg ${v}`);
});

test("phase windows stay in order within a day", () => {
  const p = computeSunPhases(new Date("2026-06-21T17:00:00Z"), FRISCO.lat, FRISCO.lng, FRISCO.tz);
  const t = (s?: string) => Date.parse(s!);
  assert.ok(t(p.sunriseWindow?.end) <= t(p.uvbWindow?.start));
  assert.ok(t(p.uvbWindow?.end) <= t(p.sunsetPhase?.start));
});

test("altitude and Earth-Sun distance nudge the modelled UV index the right way", () => {
  const sea = clearSkyUvIndex(60);
  assert.ok(clearSkyUvIndex(60, 2000) > sea * 1.1 && clearSkyUvIndex(60, 2000) < sea * 1.14);
  const jan = clearSkyUvIndex(60, 0, new Date("2026-01-03T18:00:00Z"));
  const jul = clearSkyUvIndex(60, 0, new Date("2026-07-04T18:00:00Z"));
  assert.ok(jan > jul * 1.06 && jan < jul * 1.08, `jan ${jan} jul ${jul}`);
});

test("sunNow prefers the real UV forecast and falls back to the model without one", () => {
  const phases = computeSunPhases(new Date("2026-06-21T17:00:00Z"), FRISCO.lat, FRISCO.lng, FRISCO.tz);
  const at = new Date("2026-06-21T17:30:00Z");
  const forecast: UvForecast = {
    times: [Date.parse("2026-06-21T17:00:00Z"), Date.parse("2026-06-21T18:00:00Z")],
    uv: [6, 8],
    clearSky: [10, 11],
    source: "test",
  };
  const real = sunNow(phases, at, FRISCO.lat, FRISCO.lng, { forecast });
  assert.equal(real.uvSource, "forecast");
  assert.ok(Math.abs(real.uvIndex - 7) < 1e-9);
  assert.ok(Math.abs(real.clearSkyUvIndex - 10.5) < 1e-9);
  const model = sunNow(phases, at, FRISCO.lat, FRISCO.lng);
  assert.equal(model.uvSource, "model");
  assert.ok(model.uvIndex > 9);
});

test("summarizeUvDay finds the peak and the UV 3+ window from an hourly series", () => {
  const base = Date.parse("2026-06-21T12:00:00Z");
  const uv = [0, 1, 2, 4, 7, 9, 10, 9, 7, 4, 2, 1, 0];
  const forecast: UvForecast = {
    times: uv.map((_, i) => base + i * 3_600_000),
    uv,
    clearSky: uv,
    source: "test",
  };
  const s = summarizeUvDay(forecast, new Date(base), new Date(base + 12 * 3_600_000));
  assert.ok(s);
  assert.equal(Math.round(s.peakUv), 10);
  assert.equal(s.peakAt, "2026-06-21T18:00:00.000Z");
  assert.ok(s.usefulWindow && s.hoursAtOrAbove3 >= 6.75 && s.hoursAtOrAbove3 <= 7.25);
  assert.equal(uvCategory(10), "very high");
});