import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DISPLAY_NAME_CHANGE_COOLDOWN_DAYS,
  DISPLAY_NAME_ONBOARDING_GRACE_DAYS,
  displayNameChangeBlockedUntil,
} from "@/lib/display-name-policy";

describe("display name change policy", () => {
  it("allows changes during onboarding grace", () => {
    const createdAt = new Date("2026-01-01T12:00:00Z");
    const now = new Date("2026-01-05T12:00:00Z");
    assert.equal(
      displayNameChangeBlockedUntil(
        { createdAt, displayNameChangedAt: new Date("2026-01-02T12:00:00Z") },
        now,
      ),
      null,
    );
  });

  it("blocks changes within the monthly cooldown", () => {
    const createdAt = new Date("2025-01-01T12:00:00Z");
    const changedAt = new Date("2026-01-01T12:00:00Z");
    const now = new Date("2026-01-15T12:00:00Z");
    const blockedUntil = displayNameChangeBlockedUntil(
      { createdAt, displayNameChangedAt: changedAt },
      now,
    );
    assert.ok(blockedUntil);
    assert.equal(
      blockedUntil!.toISOString(),
      new Date(
        changedAt.getTime() +
          DISPLAY_NAME_CHANGE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000,
      ).toISOString(),
    );
  });

  it("allows changes after cooldown and grace", () => {
    const createdAt = new Date("2025-01-01T12:00:00Z");
    const changedAt = new Date("2025-06-01T12:00:00Z");
    const now = new Date("2026-01-01T12:00:00Z");
    assert.equal(
      displayNameChangeBlockedUntil(
        { createdAt, displayNameChangedAt: changedAt },
        now,
      ),
      null,
    );
  });

  it("allows first display name set after grace with no prior change timestamp", () => {
    const createdAt = new Date("2025-01-01T12:00:00Z");
    const now = new Date("2026-01-01T12:00:00Z");
    assert.ok(now.getTime() - createdAt.getTime() > DISPLAY_NAME_ONBOARDING_GRACE_DAYS * 86400000);
    assert.equal(
      displayNameChangeBlockedUntil(
        { createdAt, displayNameChangedAt: null },
        now,
      ),
      null,
    );
  });
});
