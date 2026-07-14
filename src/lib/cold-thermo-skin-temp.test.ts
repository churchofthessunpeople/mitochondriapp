import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  coldThermoSkinTempBasePoints,
  OPTIMAL_COLD_THERMO_SKIN_TEMP_F,
  parseColdThermoSkinTempF,
} from "./cold-thermo-skin-temp";

describe("coldThermoSkinTempBasePoints", () => {
  const base = 24;

  it("uses full catalog base when skin temp is not set", () => {
    assert.equal(coldThermoSkinTempBasePoints(null, base), 24);
    assert.equal(coldThermoSkinTempBasePoints(undefined, base), 24);
  });

  it("awards full catalog base at 50°F and colder", () => {
    assert.equal(
      coldThermoSkinTempBasePoints(OPTIMAL_COLD_THERMO_SKIN_TEMP_F, base),
      24,
    );
    assert.equal(coldThermoSkinTempBasePoints(45, base), 24);
    assert.equal(coldThermoSkinTempBasePoints(40, base), 24);
  });

  it("diminishes by 2 points per 5°F step above 50°F", () => {
    assert.equal(coldThermoSkinTempBasePoints(55, base), 22);
    assert.equal(coldThermoSkinTempBasePoints(60, base), 20);
    assert.equal(coldThermoSkinTempBasePoints(65, base), 18);
    assert.equal(coldThermoSkinTempBasePoints(70, base), 16);
  });
});

describe("parseColdThermoSkinTempF", () => {
  it("snaps values at or below 50°F to 50°F", () => {
    assert.equal(parseColdThermoSkinTempF(48), 50);
    assert.equal(parseColdThermoSkinTempF(50), 50);
  });

  it("snaps values at or above 70°F to 70°F", () => {
    assert.equal(parseColdThermoSkinTempF(72), 70);
    assert.equal(parseColdThermoSkinTempF(75), 70);
  });
});
