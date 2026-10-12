import assert from "node:assert/strict";
import test from "node:test";
import {
  geologyScoreFromLocation,
  magmaGeologyBoostFromKm,
  MAGMA_FULL_INFLUENCE_KM,
  MAGMA_HALF_INFLUENCE_KM,
  MAGMA_ZERO_INFLUENCE_KM,
} from "./region-scoring";

test("geology proxy is full, half-strength, and zero at documented ranges", () => {
  assert.equal(magmaGeologyBoostFromKm(MAGMA_FULL_INFLUENCE_KM), 4);
  assert.equal(magmaGeologyBoostFromKm(MAGMA_HALF_INFLUENCE_KM), 2);
  assert.equal(magmaGeologyBoostFromKm(MAGMA_ZERO_INFLUENCE_KM), 0);
});

test("geology proxy falls off quickly without using inverse-square distance", () => {
  const at150 = magmaGeologyBoostFromKm(150);
  const at200 = magmaGeologyBoostFromKm(200);

  assert.ok(at150 > at200);
  assert.ok(at200 < 0.1);
  assert.equal(magmaGeologyBoostFromKm(750), 0);
});

test("El Salvador arc anchor produces local geology context", () => {
  const result = geologyScoreFromLocation(13.7, -89.2);

  assert.equal(result.nearestName, "Central American volcanic arc (El Salvador)");
  assert.equal(result.score, 5);
});
