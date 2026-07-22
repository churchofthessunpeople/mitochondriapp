import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  decodeDrinkingWaterVariant,
  encodeDrinkingWaterVariant,
  formatDrinkingWaterLabel,
  normalizeDrinkingWaterInput,
  remapDrinkingWaterFavoriteId,
} from "./drinking-water";

describe("encode/decode drinking water variant", () => {
  it("round-trips spring + salt + carbonated", () => {
    const input = normalizeDrinkingWaterInput({
      source: "spring",
      carbonation: "carbonated",
      mineral: "salt",
      mineralAmount: "pinch",
    });
    assert.deepEqual(decodeDrinkingWaterVariant(encodeDrinkingWaterVariant(input)), {
      source: "spring",
      carbonation: "carbonated",
      mineral: "salt",
      mineralAmount: "pinch",
      deuteriumPpm: null,
    });
  });

  it("round-trips DDW with ppm and baking soda", () => {
    const input = normalizeDrinkingWaterInput({
      source: "deuterium_depleted",
      carbonation: "still",
      mineral: "baking_soda",
      mineralAmount: "quarter_tsp",
      deuteriumPpm: 25,
    });
    assert.deepEqual(decodeDrinkingWaterVariant(encodeDrinkingWaterVariant(input)), {
      source: "deuterium_depleted",
      carbonation: "still",
      mineral: "baking_soda",
      mineralAmount: "quarter_tsp",
      deuteriumPpm: 25,
    });
  });

  it("round-trips RO with no minerals", () => {
    const input = normalizeDrinkingWaterInput({
      source: "reverse_osmosis",
      carbonation: "still",
      mineral: "none",
    });
    assert.deepEqual(decodeDrinkingWaterVariant(encodeDrinkingWaterVariant(input)), {
      source: "reverse_osmosis",
      carbonation: "still",
      mineral: "none",
      mineralAmount: null,
      deuteriumPpm: null,
    });
  });
});

describe("formatDrinkingWaterLabel", () => {
  it("includes ppm for DDW", () => {
    const packed = encodeDrinkingWaterVariant(
      normalizeDrinkingWaterInput({
        source: "deuterium_depleted",
        carbonation: "still",
        mineral: "none",
        deuteriumPpm: 50,
      }),
    );
    assert.equal(
      formatDrinkingWaterLabel(packed),
      "Deuterium-depleted · 50 ppm D · still",
    );
  });
});

describe("remapDrinkingWaterFavoriteId", () => {
  it("rolls legacy water types into drinking water", () => {
    assert.equal(
      remapDrinkingWaterFavoriteId("mineralized-water"),
      "drinking-water",
    );
    assert.equal(
      remapDrinkingWaterFavoriteId("carbonated-water"),
      "drinking-water",
    );
    assert.equal(
      remapDrinkingWaterFavoriteId("baking-soda-water"),
      "drinking-water",
    );
  });
});
