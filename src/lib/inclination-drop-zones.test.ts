import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  inInclinationDecayCorridor,
  lookupInclinationDropZones,
} from "@/lib/inclination-drop-zones";

describe("inInclinationDecayCorridor", () => {
  it("includes Atlanta inside 30–40°N · 80–95°W", () => {
    assert.equal(inInclinationDecayCorridor(33.75, -84.39), true);
  });

  it("excludes Denver", () => {
    assert.equal(inInclinationDecayCorridor(39.74, -104.99), false);
  });
});

describe("lookupInclinationDropZones", () => {
  it("matches Memphis zone and corridor", () => {
    const ctx = lookupInclinationDropZones(35.15, -90.05);
    assert.ok(ctx);
    assert.equal(ctx.inDecayCorridor, true);
    assert.equal(ctx.nearestZone?.id, "memphis");
  });

  it("matches New Orleans zone", () => {
    const ctx = lookupInclinationDropZones(29.95, -90.07);
    assert.ok(ctx);
    assert.equal(ctx.nearestZone?.id, "new-orleans");
  });

  it("flags Atlanta inside the decay corridor", () => {
    const ctx = lookupInclinationDropZones(33.75, -84.39);
    assert.ok(ctx);
    assert.equal(ctx.inDecayCorridor, true);
  });

  it("returns null for Denver", () => {
    assert.equal(lookupInclinationDropZones(39.74, -104.99), null);
  });

  it("matches Churchill outside the decay corridor", () => {
    const ctx = lookupInclinationDropZones(58.77, -94.17);
    assert.ok(ctx);
    assert.equal(ctx.inDecayCorridor, false);
    assert.equal(ctx.nearestZone?.id, "churchill");
  });
});
