import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  decodeGroundingVariant,
  encodeGroundingVariant,
  formatGroundingLabel,
  groundingModePoints,
} from "./grounding";

describe("encode/decode grounding variant", () => {
  it("round-trips barefoot and sphinx", () => {
    assert.equal(decodeGroundingVariant(encodeGroundingVariant("barefoot")), "barefoot");
    assert.equal(decodeGroundingVariant(encodeGroundingVariant("sphinx")), "sphinx");
  });
});

describe("groundingModePoints", () => {
  it("awards 5 for barefoot and 10 for sphinx", () => {
    assert.equal(groundingModePoints("barefoot"), 5);
    assert.equal(groundingModePoints("sphinx"), 10);
  });
});

describe("formatGroundingLabel", () => {
  it("labels modes with points", () => {
    assert.equal(
      formatGroundingLabel(encodeGroundingVariant("sphinx")),
      "Make like the Sphinx · 10 pts",
    );
  });
});
