import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  decodeExerciseVariant,
  encodeExerciseVariant,
  exerciseBasePoints,
  formatExerciseLabel,
  remapExerciseFavoriteId,
} from "./exercise";

describe("encode/decode exercise variant", () => {
  it("round-trips type and location", () => {
    for (const type of ["rebounding", "resistance_bands", "walking"] as const) {
      for (const location of ["outdoors", "indoors"] as const) {
        assert.deepEqual(
          decodeExerciseVariant(encodeExerciseVariant({ type, location })),
          { type, location },
        );
      }
    }
  });
});

describe("exerciseBasePoints", () => {
  it("prefers outdoors over indoors", () => {
    assert.equal(
      exerciseBasePoints({ type: "walking", location: "outdoors" }, 10),
      10,
    );
    assert.equal(
      exerciseBasePoints({ type: "walking", location: "indoors" }, 10),
      7,
    );
  });
});

describe("formatExerciseLabel", () => {
  it("includes type, place, and duration", () => {
    const packed = encodeExerciseVariant({
      type: "rebounding",
      location: "outdoors",
    });
    assert.equal(
      formatExerciseLabel(packed, 15),
      "Rebounding · outdoors · 15 min",
    );
  });
});

describe("remapExerciseFavoriteId", () => {
  it("rolls legacy movement into exercise", () => {
    assert.equal(remapExerciseFavoriteId("morning-movement"), "exercise");
    assert.equal(remapExerciseFavoriteId("rebounding"), "exercise");
  });
});
