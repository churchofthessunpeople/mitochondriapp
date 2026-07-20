import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAGMA_FULL_INFLUENCE_KM,
  MAGMA_ZERO_INFLUENCE_KM,
  magmaGeologyBoostFromKm,
  magnetismScoreFromLocation,
} from "./region-scoring";

describe("magmaGeologyBoostFromKm", () => {
  it("gives full boost near magma", () => {
    assert.equal(magmaGeologyBoostFromKm(0), 4);
    assert.equal(magmaGeologyBoostFromKm(MAGMA_FULL_INFLUENCE_KM), 4);
    assert.equal(magmaGeologyBoostFromKm(50), 4);
  });

  it("gives zero boost beyond influence range", () => {
    assert.equal(magmaGeologyBoostFromKm(MAGMA_ZERO_INFLUENCE_KM), 0);
    assert.equal(magmaGeologyBoostFromKm(2000), 0);
    assert.equal(magmaGeologyBoostFromKm(3500), 0);
  });

  it("falls with inverse square between full and zero", () => {
    const near = magmaGeologyBoostFromKm(150);
    const mid = magmaGeologyBoostFromKm(300);
    const far = magmaGeologyBoostFromKm(600);
    assert.ok(near > mid);
    assert.ok(mid > far);
    assert.ok(far > 0);
    assert.ok(near < 4);
  });
});

describe("magnetismScoreFromLocation", () => {
  it("scores San Salvador high (near volcanic arc)", () => {
    const mag = magnetismScoreFromLocation(13.7, -89.2);
    assert.ok(mag.score >= 4, `expected high score, got ${mag.score}`);
    assert.ok(mag.boost >= 3);
    assert.ok(mag.nearestKm < MAGMA_FULL_INFLUENCE_KM * 3);
  });

  it("sets score from rounded inverse-square boost", () => {
    const samples: [number, number][] = [
      [13.7, -89.2],
      [40.7, -74.0],
      [38.5, -98.0],
      [51.5, -0.1],
    ];
    for (const [lat, lon] of samples) {
      const mag = magnetismScoreFromLocation(lat, lon);
      const expectedBoost = Math.round(
        magmaGeologyBoostFromKm(mag.nearestKm),
      );
      assert.equal(mag.boost, expectedBoost);
      assert.equal(mag.score, Math.max(1, Math.min(5, 1 + expectedBoost)));
      if (mag.nearestKm >= MAGMA_ZERO_INFLUENCE_KM) {
        assert.equal(mag.boost, 0);
        assert.equal(mag.score, 1);
      }
    }
  });
});
