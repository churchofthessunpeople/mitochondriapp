import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  decodeVagusVariant,
  encodeVagusVariant,
  formatVagusLabel,
  remapVagusFavoriteId,
  vagusModePoints,
} from "./vagus-nerve";

describe("encode/decode vagus variant", () => {
  it("round-trips all modes", () => {
    for (const mode of [
      "cold_face_immersion",
      "baking_soda_water",
      "castor_oil_navel",
      "tuning_forks",
    ] as const) {
      assert.equal(decodeVagusVariant(encodeVagusVariant(mode)), mode);
    }
  });
});

describe("vagusModePoints", () => {
  it("matches legacy habit values", () => {
    assert.equal(vagusModePoints("cold_face_immersion"), 5);
    assert.equal(vagusModePoints("baking_soda_water"), 4);
    assert.equal(vagusModePoints("castor_oil_navel"), 6);
    assert.equal(vagusModePoints("tuning_forks"), 5);
  });
});

describe("formatVagusLabel", () => {
  it("labels castor with points", () => {
    assert.equal(
      formatVagusLabel(encodeVagusVariant("castor_oil_navel")),
      "Castor oil navel · 6 pts",
    );
  });
});

describe("remapVagusFavoriteId", () => {
  it("rolls legacy habits into vagus", () => {
    assert.equal(remapVagusFavoriteId("castor-oil-navel"), "vagus-nerve-stimulation");
    assert.equal(remapVagusFavoriteId("baking-soda-water"), "vagus-nerve-stimulation");
    assert.equal(remapVagusFavoriteId("cold-face-plunge"), "vagus-nerve-stimulation");
    assert.equal(remapVagusFavoriteId("tuning-forks"), "vagus-nerve-stimulation");
  });
});
