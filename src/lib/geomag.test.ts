import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatGeomagDisplay,
  geomagDipoleFallback,
} from "./geomag";

describe("geomagDipoleFallback", () => {
  it("gives steeper dip near poles than equator", () => {
    const eq = geomagDipoleFallback(0, 0);
    const mid = geomagDipoleFallback(33, -97);
    const pole = geomagDipoleFallback(70, 0);
    assert.ok(Math.abs(eq.inclinationDeg) < 15);
    assert.ok(mid.inclinationDeg > 40);
    assert.ok(Math.abs(pole.inclinationDeg) > Math.abs(mid.inclinationDeg));
    assert.ok(pole.totalNt > mid.totalNt);
  });
});

describe("formatGeomagDisplay", () => {
  it("formats µT and compass labels", () => {
    const d = formatGeomagDisplay({
      totalNt: 48026,
      inclinationDeg: 61.218,
      declinationDeg: 2.504,
      horizontalNt: 23123,
      verticalNt: 42093,
      model: "WMM-2025",
      date: "2026-07-13",
      source: "bgs-wmm",
    });
    assert.equal(d.totalUtLabel, "48.0 µT");
    assert.equal(d.totalGaussLabel, "0.48 G");
    assert.match(d.inclinationLabel, /down/);
    assert.match(d.declinationLabel, /E/);
  });
});
