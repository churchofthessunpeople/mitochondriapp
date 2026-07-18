import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  decodeSunExposureVariant,
  encodeSunExposureVariant,
  sunExposureBasePoints,
  sunSlotFromLocalHour,
  sunSlotFromLocalHm,
} from "@/lib/sun-exposure";

describe("sunSlotFromLocalHour", () => {
  it("maps sunrise–12 / 12–4 / 4–sunset windows", () => {
    assert.equal(sunSlotFromLocalHour(6), "morning");
    assert.equal(sunSlotFromLocalHour(9), "morning");
    assert.equal(sunSlotFromLocalHour(11), "morning");
    assert.equal(sunSlotFromLocalHour(12), "noon");
    assert.equal(sunSlotFromLocalHour(13), "noon");
    assert.equal(sunSlotFromLocalHour(15), "noon");
    assert.equal(sunSlotFromLocalHour(16), "afternoon");
    assert.equal(sunSlotFromLocalHour(17), "afternoon");
  });
});

describe("sunSlotFromLocalHm", () => {
  it("parses HH:mm", () => {
    assert.equal(sunSlotFromLocalHm("11:30"), "morning");
    assert.equal(sunSlotFromLocalHm("07:05"), "morning");
    assert.equal(sunSlotFromLocalHm("13:00"), "noon");
    assert.equal(sunSlotFromLocalHm("16:30"), "afternoon");
  });
});

describe("encode/decode sun exposure variant", () => {
  it("round-trips slot", () => {
    const packed = encodeSunExposureVariant({ slot: "noon" });
    assert.deepEqual(decodeSunExposureVariant(packed), { slot: "noon" });
  });

  it("reads slot from legacy packed values", () => {
    assert.deepEqual(decodeSunExposureVariant(20), { slot: "morning" });
  });
});

describe("sunExposureBasePoints", () => {
  it("uses full catalog base", () => {
    assert.equal(sunExposureBasePoints(8, { slot: "noon" }), 8);
  });
});
