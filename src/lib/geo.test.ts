import assert from "node:assert/strict";
import test from "node:test";
import { timezoneForCoordinates } from "./geo";

test("split-zone and territory ZIP centroids get the right IANA zone", () => {
  assert.equal(timezoneForCoordinates(30.42, -87.22, "FL"), "America/Chicago"); // Pensacola
  assert.equal(timezoneForCoordinates(31.76, -106.49, "TX"), "America/Denver"); // El Paso
  assert.equal(timezoneForCoordinates(36.16, -86.78, "TN"), "America/Chicago"); // Nashville
  assert.equal(timezoneForCoordinates(36.16, -83.0, "TN"), "America/New_York"); // east TN
  assert.equal(timezoneForCoordinates(41.6, -87.3, "IN"), "America/Chicago"); // NW Indiana
  assert.equal(timezoneForCoordinates(13.44, 144.79, "GU"), "Pacific/Guam");
  assert.equal(timezoneForCoordinates(21.31, -157.86, "HI"), "Pacific/Honolulu");
});
