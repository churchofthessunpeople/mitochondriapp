import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  densityBumpFromBand,
  populationDensityBandFromBuildings,
  scoreArtificialEmLoad,
} from "./artificial-em";

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

  it("applies population density soft bump", () => {
    const quiet = scoreArtificialEmLoad({
      cellCount: null,
      mastCount: 0,
      nearestPlantKm: null,
      densityBump: 0,
    });
    const denseFill = scoreArtificialEmLoad({
      cellCount: null,
      mastCount: 0,
      nearestPlantKm: null,
      densityBump: 2,
    });
    assert.equal(quiet, 1);
    assert.equal(denseFill, 3);
  });
});

describe("populationDensityBandFromBuildings", () => {
  it("maps building counts to bands", () => {
    assert.equal(populationDensityBandFromBuildings(10), "rural");
    assert.equal(populationDensityBandFromBuildings(200), "low");
    assert.equal(populationDensityBandFromBuildings(800), "suburban");
    assert.equal(populationDensityBandFromBuildings(2000), "urban");
    assert.equal(populationDensityBandFromBuildings(8000), "dense");
    assert.equal(populationDensityBandFromBuildings(null), null);
  });
});

describe("densityBumpFromBand", () => {
  it("fills sparse infrastructure maps in urban areas", () => {
    assert.equal(densityBumpFromBand("urban", 1), 2);
    assert.equal(densityBumpFromBand("urban", 4), 1);
    assert.equal(densityBumpFromBand("suburban", 1), 1);
    assert.equal(densityBumpFromBand("suburban", 3), 0);
    assert.equal(densityBumpFromBand("rural", 1), 0);
  });
});
