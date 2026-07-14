import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatDayActivitiesCopy,
  formatLoggedMinutes,
} from "./format-day-activities";

describe("formatLoggedMinutes", () => {
  it("formats sub-hour and hour+ durations", () => {
    assert.equal(formatLoggedMinutes(45), "45 min");
    assert.equal(formatLoggedMinutes(60), "1h");
    assert.equal(formatLoggedMinutes(75), "1h 15 min");
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
        protocolName: "Cool bedroom sleep",
        protocolId: "cool-bedroom-sleep",
        variantValue: 65,
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
    const dayIdx = text.indexOf("Activities");
    const permIdx = text.indexOf("Automatic · every day");
    assert.ok(sunriseIdx >= 0 && dayIdx > sunriseIdx && permIdx > dayIdx);
    assert.match(text, /Open-sky morning light/);
    assert.match(text, /Mastic gum/);
    assert.match(text, /Cool bedroom sleep/);
    assert.doesNotMatch(text, /Sunrise \/ early morning/);
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
