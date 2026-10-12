import assert from "node:assert/strict";
import test from "node:test";
import { formatPublicPlaceLabel, normalizePublicZip } from "./public-place";

test("normalizes five-digit and ZIP+4 input", () => {
  assert.equal(normalizePublicZip(" 75201 "), "75201");
  assert.equal(normalizePublicZip("75201-1234"), "75201");
  assert.equal(normalizePublicZip("752011234"), "75201");
});

test("rejects non-US ZIP input", () => {
  assert.equal(normalizePublicZip("7520"), null);
  assert.equal(normalizePublicZip("ABCDE"), null);
  assert.equal(normalizePublicZip(""), null);
});

test("formats a concise place label", () => {
  assert.equal(
    formatPublicPlaceLabel({ placeName: "Dallas", state: "Texas" }),
    "Dallas, Texas",
  );
  assert.equal(formatPublicPlaceLabel({ placeName: "Honolulu" }), "Honolulu");
});
