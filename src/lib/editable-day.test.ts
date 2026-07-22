import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatEditableDayLabel,
  isEditableYesterday,
  resolveEditableCompletedOn,
  yesterdayIsoFromToday,
} from "@/lib/editable-day";

describe("resolveEditableCompletedOn", () => {
  it("defaults to today", () => {
    assert.equal(resolveEditableCompletedOn("2026-07-22"), "2026-07-22");
    assert.equal(resolveEditableCompletedOn("2026-07-22", null), "2026-07-22");
    assert.equal(resolveEditableCompletedOn("2026-07-22", "nope"), "2026-07-22");
  });

  it("allows yesterday only", () => {
    assert.equal(
      resolveEditableCompletedOn("2026-07-22", "2026-07-21"),
      "2026-07-21",
    );
    assert.equal(
      resolveEditableCompletedOn("2026-07-22", "2026-07-20"),
      "2026-07-22",
    );
    assert.equal(
      resolveEditableCompletedOn("2026-07-22", "2026-07-23"),
      "2026-07-22",
    );
  });
});

describe("yesterdayIsoFromToday", () => {
  it("steps back one calendar day", () => {
    assert.equal(yesterdayIsoFromToday("2026-07-22"), "2026-07-21");
    assert.equal(yesterdayIsoFromToday("2026-03-01"), "2026-02-28");
  });
});

describe("isEditableYesterday / formatEditableDayLabel", () => {
  it("detects yesterday view", () => {
    assert.equal(isEditableYesterday("2026-07-22", "2026-07-21"), true);
    assert.equal(isEditableYesterday("2026-07-22", "2026-07-22"), false);
  });

  it("labels yesterday with weekday", () => {
    assert.equal(
      formatEditableDayLabel("2026-07-22", "2026-07-22", "Wednesday, Jul 22"),
      "Wednesday, Jul 22",
    );
    assert.match(
      formatEditableDayLabel("2026-07-21", "2026-07-22", "Wednesday, Jul 22"),
      /^Yesterday · /,
    );
  });
});
