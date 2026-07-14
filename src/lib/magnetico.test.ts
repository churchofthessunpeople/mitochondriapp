import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  magneticoGaussMultiplier,
  pointsForMagneticoGauss,
} from "./magnetico";

describe("magnetico gauss scoring", () => {
  const base = 10;

  it("applies strength multipliers to catalog base", () => {
    assert.equal(magneticoGaussMultiplier(5), 1.25);
    assert.equal(magneticoGaussMultiplier(10), 1.5);
    assert.equal(magneticoGaussMultiplier(20), 2);
    assert.equal(pointsForMagneticoGauss(5, base), 13);
    assert.equal(pointsForMagneticoGauss(10, base), 15);
    assert.equal(pointsForMagneticoGauss(20, base), 20);
  });
});
