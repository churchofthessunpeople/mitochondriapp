import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  usernameConflictMessage,
  usernameDissimilarity,
  usernameSimilarity,
} from "@/lib/username";

describe("username similarity", () => {
  it("treats identical names as fully similar", () => {
    assert.equal(usernameSimilarity("alice", "Alice"), 1);
    assert.equal(usernameDissimilarity("alice", "Alice"), 0);
  });

  it("rejects near-duplicates under the 75% rule", () => {
    assert.ok(usernameDissimilarity("alice", "alice1") < 0.75);
    assert.match(
      usernameConflictMessage("alice1", ["alice"]) ?? "",
      /too similar/i,
    );
  });

  it("allows clearly different names", () => {
    assert.ok(usernameDissimilarity("alice", "sunwalker") >= 0.75);
    assert.equal(usernameConflictMessage("sunwalker", ["alice"]), null);
  });

  it("prompts for a dissimilar name when exact match exists", () => {
    assert.match(
      usernameConflictMessage("alice", ["alice"]) ?? "",
      /taken.*75%/i,
    );
  });
});
