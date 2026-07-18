import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MIN_DISPLAY_NAME_DISSIMILARITY,
  nameConflictMessage,
  nameSimilarity,
} from "@/lib/name-similarity";

describe("display name similarity", () => {
  it("allows extending a first name into a full name", () => {
    assert.ok(nameSimilarity("steve", "steve sermons") < 0.9);
    assert.equal(
      nameConflictMessage(
        "steve sermons",
        ["steve"],
        { taken: "taken", similar: "too similar" },
        MIN_DISPLAY_NAME_DISSIMILARITY,
      ),
      null,
    );
  });

  it("rejects near-identical display names", () => {
    assert.ok(nameSimilarity("christopher", "christophe") > 0.9);
    assert.match(
      nameConflictMessage(
        "christophe",
        ["christopher"],
        { taken: "taken", similar: "too similar" },
        MIN_DISPLAY_NAME_DISSIMILARITY,
      ) ?? "",
      /too similar/i,
    );
  });
});
