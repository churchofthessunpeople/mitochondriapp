import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  coldThermoBasePoints,
  coldThermoFaceImmersionBasePoints,
  coldThermoSkinTempBasePoints,
  decodeColdThermoVariant,
  encodeColdThermoVariant,
  formatColdThermoLabel,
  OPTIMAL_COLD_THERMO_SKIN_TEMP_F,
  parseColdThermoSkinTempF,
  remapColdThermoFavoriteId,
} from "./cold-thermo-skin-temp";

describe("coldThermoSkinTempBasePoints", () => {
  const base = 24;

  it("uses full catalog base when skin temp is not set", () => {
    assert.equal(coldThermoSkinTempBasePoints(null, base), 24);
    assert.equal(coldThermoSkinTempBasePoints(undefined, base), 24);
  });

  it("awards full catalog base at 50°F", () => {
    assert.equal(
      coldThermoSkinTempBasePoints(OPTIMAL_COLD_THERMO_SKIN_TEMP_F, base),
      24,
    );
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

describe("encode/decode cold thermo variant", () => {
  it("round-trips plunge, shower, and face modes", () => {
    assert.deepEqual(
      decodeColdThermoVariant(
        encodeColdThermoVariant({
          mode: "plunge",
          skinTempF: 55,
        }),
      ),
      { mode: "plunge", skinTempF: 55 },
    );
    assert.deepEqual(
      decodeColdThermoVariant(
        encodeColdThermoVariant({
          mode: "shower",
          skinTempF: 60,
        }),
      ),
      { mode: "shower", skinTempF: 60 },
    );
    assert.deepEqual(
      decodeColdThermoVariant(
        encodeColdThermoVariant({
          mode: "face_immersion",
          skinTempF: 50,
        }),
      ),
      { mode: "face_immersion", skinTempF: 50 },
    );
  });

  it("treats legacy bare temps as cold plunge", () => {
    assert.deepEqual(decodeColdThermoVariant(60), {
      mode: "plunge",
      skinTempF: 60,
    });
  });
});

describe("coldThermoFaceImmersionBasePoints", () => {
  it("scales to about 5 pts at 50°F when catalog is 24", () => {
    assert.equal(coldThermoFaceImmersionBasePoints(50, 24), 5);
    assert.equal(
      coldThermoBasePoints(
        { mode: "face_immersion", skinTempF: 50 },
        24,
      ),
      5,
    );
  });
});

describe("formatColdThermoLabel", () => {
  it("shows rounds for face immersion", () => {
    const packed = encodeColdThermoVariant({
      mode: "face_immersion",
      skinTempF: 50,
    });
    assert.equal(
      formatColdThermoLabel(packed),
      "Face immersion · 50°F skin · 3 rounds",
    );
  });
});

describe("remapColdThermoFavoriteId", () => {
  it("rolls face plunge into cold thermogenesis", () => {
    assert.equal(
      remapColdThermoFavoriteId("cold-face-plunge"),
      "cold-thermogenesis",
    );
  });
});
