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
  it("maps clock windows", () => {
    assert.equal(sunSlotFromLocalHour(6), "morning");
    assert.equal(sunSlotFromLocalHour(9), "morning");
    assert.equal(sunSlotFromLocalHour(10), "noon");
    assert.equal(sunSlotFromLocalHour(13), "noon");
    assert.equal(sunSlotFromLocalHour(14), "afternoon");
    assert.equal(sunSlotFromLocalHour(17), "afternoon");
  });
});

describe("sunSlotFromLocalHm", () => {
  it("parses HH:mm", () => {
    assert.equal(sunSlotFromLocalHm("11:30"), "noon");
    assert.equal(sunSlotFromLocalHm("07:05"), "morning");
  });
});

describe("encode/decode sun exposure variant", () => {
  it("round-trips modifiers", () => {
    const packed = encodeSunExposureVariant({
      slot: "noon",
      grounded: true,
      skin: "partial",
    });
    assert.deepEqual(decodeSunExposureVariant(packed), {
      slot: "noon",
      grounded: true,
      skin: "partial",
    });
  });
});

describe("sunExposureBasePoints", () => {
  it("reduces for covered / not grounded", () => {
    const full = sunExposureBasePoints(8, { grounded: true, skin: "full" });
    const covered = sunExposureBasePoints(8, {
      grounded: false,
      skin: "minimal",
    });
    assert.equal(full, 8);
    assert.ok(covered < full);
  });
});
