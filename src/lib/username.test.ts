import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MIN_USERNAME_DISSIMILARITY,
  nameConflictMessage,
} from "@/lib/name-similarity";
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

  it("allows short distinct names under the 90% rule", () => {
    assert.ok(usernameSimilarity("smm", "ssm") < 0.9);
    assert.equal(
      usernameConflictMessage("smm", ["ssm"], {
        taken: "taken",
        similar: "too similar",
      }),
      null,
    );
  });

  it("rejects near-identical usernames under the 90% rule", () => {
    assert.ok(usernameSimilarity("christopher", "christophe") > 0.9);
    assert.match(
      nameConflictMessage(
        "christophe",
        ["christopher"],
        { taken: "taken", similar: "too similar" },
        MIN_USERNAME_DISSIMILARITY,
      ) ?? "",
      /too similar/i,
    );
  });

  it("allows clearly different names", () => {
    assert.ok(usernameDissimilarity("alice", "sunwalker") >= 0.75);
    assert.equal(
      usernameConflictMessage("sunwalker", ["alice"], {
        taken: "taken",
        similar: "similar",
      }),
      null,
    );
  });

  it("prompts when an exact match exists", () => {
    assert.match(
      usernameConflictMessage("alice", ["alice"], {
        taken:
          "Username: already taken. Choose another that is less than 90% similar to existing usernames.",
        similar: "similar",
      }) ?? "",
      /Username:.*taken.*90%/i,
    );
  });
});
