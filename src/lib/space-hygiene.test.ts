import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_SLEEP_SPACE_CONFIG,
  DEFAULT_WORK_SPACE_CONFIG,
  migrateLegacyFavoritesToSpaceConfigs,
  pointsForSleepSpace,
  pointsForWorkSpace,
} from "@/lib/space-hygiene";

describe("pointsForSleepSpace", () => {
  it("sums enabled flat options", () => {
    assert.equal(
      pointsForSleepSpace({
        ...DEFAULT_SLEEP_SPACE_CONFIG,
        trueDark: true,
        circadianWindow: true,
        phoneAway: true,
        groundingMat: true,
      }),
      8 + 7 + 5 + 10,
    );
  });

  it("adds magnetico and cool bedroom curves", () => {
    assert.equal(
      pointsForSleepSpace(
        {
          ...DEFAULT_SLEEP_SPACE_CONFIG,
          magnetico: true,
          coolBedroom: true,
        },
        { magneticoGauss: 20, sleepRoomTempF: 65 },
      ),
      50 + 10,
    );
  });
});

describe("pointsForWorkSpace", () => {
  it("sums enabled options", () => {
    assert.equal(
      pointsForWorkSpace({
        ...DEFAULT_WORK_SPACE_CONFIG,
        breakersOff: true,
        groundingMat: true,
        negativeIon: true,
        lowArtificialField: true,
      }),
      6 + 10 + 10 + 5,
    );
  });
});

describe("migrateLegacyFavoritesToSpaceConfigs", () => {
  it("rolls legacy sleep/office favorites into spaces", () => {
    const result = migrateLegacyFavoritesToSpaceConfigs({
      favoriteIds: [
        "magnetico-sleep-pad",
        "dark-bedroom",
        "consistent-sleep-window",
        "breaker-off-office",
        "air-tube-headphones",
      ],
      sleepConfig: DEFAULT_SLEEP_SPACE_CONFIG,
      workConfig: DEFAULT_WORK_SPACE_CONFIG,
    });
    assert.equal(result.changed, true);
    assert.equal(result.sleepConfig.magnetico, true);
    assert.equal(result.sleepConfig.trueDark, true);
    assert.equal(result.sleepConfig.circadianWindow, true);
    assert.equal(result.workConfig.breakersOff, true);
    assert.ok(result.nextFavoriteIds.includes("sleep-space"));
    assert.ok(result.nextFavoriteIds.includes("work-space"));
    assert.ok(result.nextFavoriteIds.includes("air-tube-headphones"));
    assert.ok(!result.nextFavoriteIds.includes("magnetico-sleep-pad"));
    assert.ok(!result.nextFavoriteIds.includes("consistent-sleep-window"));
    assert.ok(!result.nextFavoriteIds.includes("breaker-off-office"));
  });
});
