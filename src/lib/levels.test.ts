import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { LEVEL_THRESHOLDS, MAX_LEVEL, levelFromXp } from "@/lib/levels";

describe("levelFromXp", () => {
  it("starts at level 1", () => {
    const p = levelFromXp(0);
    assert.equal(p.level, 1);
    assert.equal(p.xpToNextLevel, 3_500);
    assert.equal(p.progress, 0);
  });

  it("enters level 2 at first threshold", () => {
    const p = levelFromXp(3_500);
    assert.equal(p.level, 2);
    assert.equal(p.xpIntoLevel, 0);
  });

  it("reaches level 10 at one year of 500 pts/day", () => {
    assert.equal(LEVEL_THRESHOLDS[MAX_LEVEL - 1], 500 * 365);
    const p = levelFromXp(182_500);
    assert.equal(p.level, 10);
    assert.equal(p.xpToNextLevel, null);
    assert.equal(p.progress, 1);
  });

  it("reports progress within a band", () => {
    // L2 starts at 3,500; L3 at 10,500 → span 7,000
    const p = levelFromXp(3_500 + 3_500);
    assert.equal(p.level, 2);
    assert.equal(p.xpIntoLevel, 3_500);
    assert.equal(p.xpForNextLevel, 7_000);
    assert.equal(p.xpToNextLevel, 3_500);
    assert.ok(Math.abs(p.progress - 0.5) < 1e-9);
  });
});
