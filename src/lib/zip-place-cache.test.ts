import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isZipPlaceCacheFresh,
  normalizeUsZip,
  ZIP_PLACE_CACHE_TTL_MS,
} from "./zip-place-cache";

describe("normalizeUsZip", () => {
  it("normalizes 5-digit and ZIP+4", () => {
    assert.equal(normalizeUsZip("90210"), "90210");
    assert.equal(normalizeUsZip("90210-1234"), "90210");
    assert.equal(normalizeUsZip(" 75001 "), "75001");
    assert.equal(normalizeUsZip("invalid"), null);
  });
});

describe("isZipPlaceCacheFresh", () => {
  it("treats entries within 30 days as fresh", () => {
    const recent = new Date(Date.now() - ZIP_PLACE_CACHE_TTL_MS + 60_000);
    assert.equal(isZipPlaceCacheFresh(recent), true);
  });

  it("expires entries older than 30 days", () => {
    const stale = new Date(Date.now() - ZIP_PLACE_CACHE_TTL_MS - 1);
    assert.equal(isZipPlaceCacheFresh(stale), false);
  });
});
