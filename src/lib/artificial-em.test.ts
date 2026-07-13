import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { scoreArtificialEmLoad } from "./artificial-em";

describe("scoreArtificialEmLoad", () => {
  it("scores quiet areas low", () => {
    assert.equal(
      scoreArtificialEmLoad({
        cellCount: 0,
        mastCount: 0,
        nearestPlantKm: null,
      }),
      1,
    );
  });

  it("raises score with dense cells", () => {
    assert.equal(
      scoreArtificialEmLoad({
        cellCount: 100,
        mastCount: 0,
        nearestPlantKm: null,
      }),
      5,
    );
  });

  it("bumps for nearby power plant", () => {
    const base = scoreArtificialEmLoad({
      cellCount: null,
      mastCount: 3,
      nearestPlantKm: null,
    });
    const near = scoreArtificialEmLoad({
      cellCount: null,
      mastCount: 3,
      nearestPlantKm: 3,
    });
    assert.ok(near >= base);
    assert.ok(near <= 5);
  });
});
