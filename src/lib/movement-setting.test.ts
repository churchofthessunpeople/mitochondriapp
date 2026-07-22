import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  decodeMovementSettingVariant,
  encodeMovementSettingVariant,
  movementSettingBasePoints,
  requiresMovementSetting,
} from "@/lib/movement-setting";

describe("requiresMovementSetting", () => {
  it("matches movement category with duration", () => {
    assert.equal(
      requiresMovementSetting({ category: "movement", durationEnabled: true }),
      true,
    );
    assert.equal(
      requiresMovementSetting({ category: "movement", durationEnabled: false }),
      false,
    );
    assert.equal(
      requiresMovementSetting({ category: "cold", durationEnabled: true }),
      false,
    );
  });

  it("skips mastic gum and Exercise (dedicated dialogs)", () => {
    assert.equal(
      requiresMovementSetting({
        id: "mastic-gum",
        category: "movement",
        durationEnabled: true,
      }),
      false,
    );
    assert.equal(
      requiresMovementSetting({
        id: "exercise",
        category: "movement",
        durationEnabled: true,
      }),
      false,
    );
    assert.equal(
      requiresMovementSetting({
        id: "rebounding",
        category: "movement",
        durationEnabled: true,
      }),
      false,
    );
  });
});

describe("encode/decode movement setting variant", () => {
  it("round-trips settings", () => {
    for (const setting of ["full_sunlight", "outside", "indoors"] as const) {
      const packed = encodeMovementSettingVariant(setting);
      assert.equal(decodeMovementSettingVariant(packed), setting);
    }
  });
});

describe("movementSettingBasePoints", () => {
  it("prefers sunlight over indoors", () => {
    const sun = movementSettingBasePoints("full_sunlight", 10);
    const indoor = movementSettingBasePoints("indoors", 10);
    assert.ok(sun > indoor);
    assert.equal(sun, 10);
    assert.equal(indoor, 7);
  });
});
