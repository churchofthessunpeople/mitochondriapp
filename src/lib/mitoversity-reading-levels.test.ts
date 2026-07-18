import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MITOVERSITY_ENTRIES } from "@/lib/mitoversity";
import { mitoEntryHasReadingLevels } from "@/lib/mitoversity-reading-levels";
import { MITO_READING_LEVEL_META } from "@/lib/mitoversity-reading-levels";

describe("Mitoversity reading levels coverage", () => {
  it("every article has all three reading tiers", () => {
    const missing: string[] = [];
    for (const entry of MITOVERSITY_ENTRIES) {
      if (!mitoEntryHasReadingLevels(entry)) {
        missing.push(entry.id);
        continue;
      }
      for (const meta of MITO_READING_LEVEL_META) {
        const count = entry.readingLevels?.[meta.id]?.sections.length ?? 0;
        assert.ok(count > 0, `${entry.id} missing ${meta.id} sections`);
      }
    }
    assert.equal(
      missing.length,
      0,
      `Missing reading levels: ${missing.join(", ")}`,
    );
  });

  it("includes protocol guides and curriculum entries", () => {
    assert.ok(MITOVERSITY_ENTRIES.length >= 35);
  });
});
