import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  encodeDrinkingWaterVariant,
  normalizeDrinkingWaterInput,
} from "./drinking-water";
import {
  formatDayActivitiesCopy,
  formatLoggedMinutes,
  formatMultiLogCount,
  formatPerformedSessionsSummary,
  formatTodayMultiLogStatus,
  formatWeekActivitiesCopy,
} from "./format-day-activities";
import { encodeSunExposureVariant } from "./sun-exposure";

describe("formatLoggedMinutes", () => {
  it("formats sub-hour and hour+ durations", () => {
    assert.equal(formatLoggedMinutes(45), "45 min");
    assert.equal(formatLoggedMinutes(60), "1h");
    assert.equal(formatLoggedMinutes(75), "1h 15 min");
  });
});

describe("formatMultiLogCount", () => {
  it("formats singular and plural log counts", () => {
    assert.equal(formatMultiLogCount(1), "1 log");
    assert.equal(formatMultiLogCount(3), "3 logs");
    assert.equal(formatMultiLogCount(0), "");
  });
});

describe("formatTodayMultiLogStatus", () => {
  it("shows cumulative points and log count", () => {
    assert.equal(
      formatTodayMultiLogStatus(4, 3),
      "12 pts today · 3 logs",
    );
    assert.equal(formatTodayMultiLogStatus(5, 1), "5 pts today · 1 log");
  });
});

describe("formatDayActivitiesCopy", () => {
  it("groups timed logs into one line with total minutes and points", () => {
    const text = formatDayActivitiesCopy("2026-07-14", [
      {
        protocolName: "Barefoot earth",
        durationMinutes: 15,
        pointsEarned: 5,
        isStreakBonus: false,
      },
      {
        protocolName: "Barefoot earth",
        durationMinutes: 15,
        pointsEarned: 5,
        isStreakBonus: false,
      },
      {
        protocolName: "Mastic gum",
        durationMinutes: null,
        pointsEarned: 3,
        isStreakBonus: false,
      },
    ]);

    assert.match(text, /^Tuesday, July 14, 2026/);
    assert.match(text, /• Barefoot earth \(30 min\) — 10 pts/);
    assert.match(text, /• Mastic gum — 3 pts/);
    assert.match(text, /Total: 13 pts · 30 min logged/);
  });

  it("includes streak bonus in total", () => {
    const text = formatDayActivitiesCopy("2026-07-14", [
      {
        protocolName: "Mastic gum",
        durationMinutes: null,
        pointsEarned: 3,
        isStreakBonus: false,
      },
      {
        protocolName: "Streak bonus",
        durationMinutes: null,
        pointsEarned: 2,
        isStreakBonus: true,
      },
    ]);

    assert.match(text, /• Mastic gum — 3 pts/);
    assert.match(text, /• Streak bonus — 2 pts/);
    assert.match(text, /Total: 5 pts$/m);
    assert.doesNotMatch(text, /logged/);
  });

  it("includes sunrise viewing tier, session timing, and day boost", () => {
    const text = formatDayActivitiesCopy("2026-07-14", [
      {
        protocolName: "Sun over the horizon",
        protocolId: "sunrise-horizon",
        durationMinutes: 25150,
        variantValue: -15,
        sunriseBuffMultiplier: 2,
        pointsEarned: 12,
        isStreakBonus: false,
      },
      {
        protocolName: "Mastic gum",
        durationMinutes: null,
        pointsEarned: 3,
        isStreakBonus: false,
      },
    ]);

    assert.match(
      text,
      /• Sun over the horizon \(Horizon sunrise · Clear skies · 15 min before – 15 min after \(optimal\) · 2× day boost\) — 12 pts/,
    );
    assert.match(text, /• Mastic gum — 3 pts/);
    assert.match(text, /Total: 15 pts/);
  });

  it("does not multiply points for duplicate single-log rows", () => {
    const text = formatDayActivitiesCopy("2026-07-14", [
      {
        protocolName: "Cool bedroom sleep",
        protocolId: "cool-bedroom-sleep",
        variantValue: 65,
        durationMinutes: null,
        pointsEarned: 15,
        isStreakBonus: false,
      },
      {
        protocolName: "Cool bedroom sleep",
        protocolId: "cool-bedroom-sleep",
        variantValue: 65,
        durationMinutes: null,
        pointsEarned: 15,
        isStreakBonus: false,
      },
      {
        protocolName: "Cool bedroom sleep",
        protocolId: "cool-bedroom-sleep",
        variantValue: 65,
        durationMinutes: null,
        pointsEarned: 15,
        isStreakBonus: false,
      },
    ]);

    assert.match(text, /• Cool bedroom sleep \(65°F\) — 15 pts/);
    assert.match(text, /Total: 15 pts$/m);
  });

  it("sections sunrise, day, and permanent activities", () => {
    const text = formatDayActivitiesCopy("2026-07-14", [
      {
        protocolName: "Sleep Space",
        protocolId: "sleep-space",
        durationMinutes: null,
        pointsEarned: 10,
        isStreakBonus: false,
      },
      {
        protocolName: "Open-sky morning light",
        protocolId: "sunrise-open-sky",
        durationMinutes: null,
        sunriseBuffMultiplier: 1.5,
        pointsEarned: 8,
        isStreakBonus: false,
      },
      {
        protocolName: "Mastic gum",
        protocolId: "mastic-gum",
        durationMinutes: 30,
        pointsEarned: 16,
        isStreakBonus: false,
      },
    ]);

    const sunriseIdx = text.indexOf("Sunrise\n");
    const dayIdx = text.indexOf("Performed");
    const permIdx = text.indexOf("Permanent\n");
    assert.ok(sunriseIdx >= 0 && dayIdx > sunriseIdx && permIdx > dayIdx);
    assert.match(text, /Open-sky morning light/);
    assert.match(text, /Mastic gum/);
    assert.match(text, /Sleep Space/);
    assert.doesNotMatch(text, /Sunrise \/ early morning/);
    assert.doesNotMatch(text, /Automatic · every day/);
  });

  it("shows log count for multi-log activities without a timer", () => {
    const text = formatDayActivitiesCopy("2026-07-14", [
      {
        protocolName: "Deuterium-aware meal",
        protocolId: "deuterium-aware-meal",
        durationMinutes: null,
        pointsEarned: 8,
        isStreakBonus: false,
      },
      {
        protocolName: "Deuterium-aware meal",
        protocolId: "deuterium-aware-meal",
        durationMinutes: null,
        pointsEarned: 8,
        isStreakBonus: false,
      },
      {
        protocolName: "Deuterium-aware meal",
        protocolId: "deuterium-aware-meal",
        durationMinutes: null,
        pointsEarned: 8,
        isStreakBonus: false,
      },
    ]);

    assert.match(text, /• Deuterium-aware meal \(3 logs\) — 24 pts/);
  });

  it("handles empty activity days", () => {
    const text = formatDayActivitiesCopy("2026-07-14", [
      {
        protocolName: "Streak bonus",
        durationMinutes: null,
        pointsEarned: 2,
        isStreakBonus: true,
      },
    ]);
    assert.match(text, /• Streak bonus — 2 pts/);
    assert.match(text, /Total: 2 pts/);
  });
});

describe("formatDayActivitiesCopy variants", () => {
  it("keeps distinct Outside Time and water mixes on separate lines", () => {
    const morningFull = encodeSunExposureVariant({
      slot: "morning",
      cover: "full_sun",
    });
    const noonShaded = encodeSunExposureVariant({
      slot: "noon",
      cover: "shaded",
    });
    const roSaltCarb = encodeDrinkingWaterVariant(
      normalizeDrinkingWaterInput({
        source: "reverse_osmosis",
        carbonation: "carbonated",
        mineral: "salt",
        mineralAmount: "eighth_tsp",
      }),
    );
    const springStill = encodeDrinkingWaterVariant(
      normalizeDrinkingWaterInput({
        source: "spring",
        carbonation: "still",
        mineral: "none",
      }),
    );
    const text = formatDayActivitiesCopy("2026-07-14", [
      {
        protocolName: "Outside Time",
        protocolId: "sun-exposure",
        variantValue: morningFull,
        durationMinutes: 60,
        pointsEarned: 10,
        isStreakBonus: false,
      },
      {
        protocolName: "Outside Time",
        protocolId: "sun-exposure",
        variantValue: noonShaded,
        durationMinutes: 30,
        pointsEarned: 6,
        isStreakBonus: false,
      },
      {
        protocolName: "Drinking water",
        protocolId: "drinking-water",
        variantValue: roSaltCarb,
        durationMinutes: null,
        pointsEarned: 4,
        isStreakBonus: false,
      },
      {
        protocolName: "Drinking water",
        protocolId: "drinking-water",
        variantValue: springStill,
        durationMinutes: null,
        pointsEarned: 4,
        isStreakBonus: false,
      },
    ]);

    assert.match(text, /Outside Time \(Morning · Full sun\) \(1h\)/);
    assert.match(text, /Outside Time \(Peak sun · Shaded\) \(30 min\)/);
    assert.match(
      text,
      /Drinking water \(Reverse osmosis · Salt ⅛ tsp · carbonated\) \(1 log\)/,
    );
    assert.match(text, /Drinking water \(Spring water · still\) \(1 log\)/);
    assert.match(text, /Total: 24 pts · 1h 30 min logged/);
  });

  it("stacks identical Outside Time variants into one timed line", () => {
    const morningFull = encodeSunExposureVariant({
      slot: "morning",
      cover: "full_sun",
    });
    const text = formatDayActivitiesCopy("2026-07-14", [
      {
        protocolName: "Outside Time",
        protocolId: "sun-exposure",
        variantValue: morningFull,
        durationMinutes: 60,
        pointsEarned: 10,
        isStreakBonus: false,
      },
      {
        protocolName: "Outside Time",
        protocolId: "sun-exposure",
        variantValue: morningFull,
        durationMinutes: 30,
        pointsEarned: 5,
        isStreakBonus: false,
      },
    ]);

    assert.match(text, /Outside Time \(Morning · Full sun\) \(1h 30 min\) — 15 pts/);
    assert.equal((text.match(/Outside Time/g) ?? []).length, 1);
  });
});

describe("formatPerformedSessionsSummary", () => {
  it("summarizes Outside Time and water sessions for Performed", () => {
    const summaryOutside = formatPerformedSessionsSummary("sun-exposure", [
      {
        protocolId: "sun-exposure",
        variantValue: encodeSunExposureVariant({
          slot: "morning",
          cover: "full_sun",
        }),
        durationMinutes: 60,
      },
      {
        protocolId: "sun-exposure",
        variantValue: encodeSunExposureVariant({
          slot: "noon",
          cover: "full_sun",
        }),
        durationMinutes: 60,
      },
      {
        protocolId: "sun-exposure",
        variantValue: encodeSunExposureVariant({
          slot: "noon",
          cover: "shaded",
        }),
        durationMinutes: 30,
      },
    ]);
    assert.equal(
      summaryOutside,
      "1h Morning · Full sun · 1h Peak sun · Full sun · 30 min Peak sun · Shaded",
    );

    const summaryWater = formatPerformedSessionsSummary("drinking-water", [
      {
        protocolId: "drinking-water",
        variantValue: encodeDrinkingWaterVariant(
          normalizeDrinkingWaterInput({
            source: "reverse_osmosis",
            carbonation: "carbonated",
            mineral: "salt",
            mineralAmount: "eighth_tsp",
          }),
        ),
        durationMinutes: null,
      },
      {
        protocolId: "drinking-water",
        variantValue: encodeDrinkingWaterVariant(
          normalizeDrinkingWaterInput({
            source: "spring",
            carbonation: "still",
            mineral: "none",
          }),
        ),
        durationMinutes: null,
      },
    ]);
    assert.equal(
      summaryWater,
      "Reverse osmosis · Salt ⅛ tsp · carbonated · Spring water · still",
    );
  });
});

describe("formatWeekActivitiesCopy", () => {
  it("sums timed and count activities across days", () => {
    const text = formatWeekActivitiesCopy("Week total · Sun–Sun", [
      {
        protocolName: "Barefoot earth",
        protocolId: "barefoot-earth",
        durationMinutes: 15,
        pointsEarned: 5,
        isStreakBonus: false,
      },
      {
        protocolName: "Barefoot earth",
        protocolId: "barefoot-earth",
        durationMinutes: 20,
        pointsEarned: 6,
        isStreakBonus: false,
      },
      {
        protocolName: "Deuterium-aware meal",
        protocolId: "deuterium-aware-meal",
        durationMinutes: null,
        pointsEarned: 8,
        isStreakBonus: false,
      },
      {
        protocolName: "Deuterium-aware meal",
        protocolId: "deuterium-aware-meal",
        durationMinutes: null,
        pointsEarned: 8,
        isStreakBonus: false,
      },
    ]);

    assert.match(text, /• Barefoot earth \(35 min\) — 11 pts/);
    assert.match(text, /• Deuterium-aware meal \(2 logs\) — 16 pts/);
    assert.match(text, /Total: 27 pts · 35 min logged/);
  });
});
