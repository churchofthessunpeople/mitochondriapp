import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pointsForMagneticoGauss } from "./magnetico";

describe("magnetico gauss scoring", () => {
  it("awards flat points by gauss (no multipliers)", () => {
    assert.equal(pointsForMagneticoGauss(5), 10);
    assert.equal(pointsForMagneticoGauss(10), 25);
    assert.equal(pointsForMagneticoGauss(20), 50);
  });
});
