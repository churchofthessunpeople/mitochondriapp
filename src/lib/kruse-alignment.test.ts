import assert from "node:assert/strict";
import test from "node:test";
import { GROUP_WEIGHTS, scoreAlignment } from "./kruse-alignment";
import type { PublicPlaceResult } from "./public-place";
import { computeSunPhases } from "./sun-phases";

function place(over: {
  lat: number;
  lng: number;
  state: string;
  totalNt: number;
  dip: number;
  decl: number;
  svDec?: number;
  svDip?: number;
  volcanoKm?: number | null;
  elevationM?: number | null;
  load?: number | null;
  bedrockKind?: "volcanic" | "other" | null;
  hawaii?: boolean;
}): PublicPlaceResult {
  return {
    latitude: over.lat,
    longitude: over.lng,
    stateAbbr: over.state,
    elevationM: over.elevationM ?? 10,
    sunPhases: computeSunPhases(new Date("2026-11-05T18:00:00Z"), over.lat, over.lng, "UTC"),
    factors: {
      geomag: {
        totalNt: over.totalNt,
        inclinationDeg: over.dip,
        declinationDeg: over.decl,
        declinationKnown: true,
        inclinationLabel: "",
        declinationLabel: `${over.decl}°`,
        svDeclinationDegPerYear: over.svDec ?? 0.01,
        svInclinationDegPerYear: over.svDip ?? 0.01,
        svTotalNtPerYear: 0,
        declinationGradient: null,
      },
      bedrock: over.bedrockKind
        ? { kind: over.bedrockKind, rockLabel: "basalt" }
        : null,
      dipZone: null,
      volcano: {
        hawaii: over.hawaii ?? false,
        nearest:
          over.volcanoKm == null
            ? null
            : { name: "Test Volcano", distanceKm: over.volcanoKm },
      },
      artificialEm:
        over.load == null ? null : { loadScore: over.load, loadLabel: "x" },
    },
  } as unknown as PublicPlaceResult;
}

const ideal = place({
  lat: 15, lng: -90, state: "", totalNt: 52_000, dip: 20, decl: 0.3,
  volcanoKm: 10, load: 1, bedrockKind: "volcanic",
});
const poor = place({
  lat: 62, lng: -150, state: "AK", totalNt: 52_000, dip: 76, decl: 14,
  svDec: 0.4, svDip: 0.3, volcanoKm: null, load: 5,
});

test("group weights sum to 100 with magnetism first and sun second", () => {
  const w = Object.values(GROUP_WEIGHTS).map((g) => g.weight);
  assert.equal(w.reduce((a, b) => a + b, 0), 100);
  const sorted = Object.entries(GROUP_WEIGHTS).sort((a, b) => b[1].weight - a[1].weight);
  assert.equal(sorted[0]![0], "magnetism");
  assert.equal(sorted[1]![0], "sun");
});

test("an ideal tropical volcanic place scores far above a high-latitude steep-dip place", () => {
  const a = scoreAlignment(ideal, ideal.sunPhases);
  const b = scoreAlignment(poor, poor.sunPhases);
  assert.ok(a.total! >= 80, `ideal ${a.total}`);
  assert.ok(b.total! <= 40, `poor ${b.total}`);
  assert.equal(a.label, "Strong alignment");
});

test("every criterion carries a reading, a points value and an explanation", () => {
  const r = scoreAlignment(ideal, ideal.sunPhases);
  for (const c of r.criteria) {
    assert.ok(c.explanation.length > 40, c.id);
    assert.ok(c.value.length > 0, c.id);
    assert.ok(c.points != null && c.points <= c.weight, c.id);
  }
});

test("missing readings drop out of the total instead of counting as zero", () => {
  const partial = place({
    lat: 15, lng: -90, state: "", totalNt: 52_000, dip: 20, decl: 0.3,
    volcanoKm: 10, load: null, elevationM: null, bedrockKind: "volcanic",
  });
  const r = scoreAlignment(partial, partial.sunPhases);
  assert.ok(r.coverage < 1);
  assert.ok(r.total! >= 80, `partial ${r.total}`);
  assert.equal(r.criteria.find((c) => c.id === "wireless")!.status, "unknown");
});

test("magnetism outweighs sun: a weak field with great sun loses to a strong field with weaker sun", () => {
  const weakField = place({
    lat: 10, lng: -80, state: "", totalNt: 31_000, dip: 85, decl: 14,
    svDec: 0.4, svDip: 0.3, volcanoKm: 500, load: 3,
  });
  const strongField = place({
    lat: 40, lng: -100, state: "", totalNt: 58_000, dip: 40, decl: 0.5,
    volcanoKm: 500, load: 3,
  });
  const a = scoreAlignment(weakField, weakField.sunPhases);
  const b = scoreAlignment(strongField, strongField.sunPhases);
  const mag = (r: typeof a) => r.groups.find((g) => g.id === "magnetism")!.points;
  assert.ok(mag(b) > mag(a) + 20);
});

test("L lineage is stricter on declination; ABCDF wants a stronger field", () => {
  const p = place({
    lat: 20, lng: -100, state: "", totalNt: 42_000, dip: 40, decl: 4,
    volcanoKm: 500, load: 2,
  });
  const dec = (h: "unknown" | "L" | "ABCDF") =>
    scoreAlignment(p, p.sunPhases, h).criteria.find((c) => c.id === "declination")!.fraction!;
  const inten = (h: "unknown" | "L" | "ABCDF") =>
    scoreAlignment(p, p.sunPhases, h).criteria.find((c) => c.id === "intensity")!.fraction!;
  assert.ok(dec("L") < dec("unknown"));
  assert.ok(inten("L") > inten("unknown"));
  assert.ok(inten("ABCDF") < inten("unknown"));
});

test("Hawaii volcanic ground is capped, and a stressed fault zone zeroes that criterion", () => {
  const hi = place({
    lat: 19.5, lng: -155.5, state: "HI", totalNt: 35_000, dip: 36, decl: 8,
    volcanoKm: 5, hawaii: true, bedrockKind: "volcanic", load: 1,
  });
  assert.ok(scoreAlignment(hi, hi.sunPhases).criteria.find((c) => c.id === "anchor")!.fraction! <= 0.5);
  const nm = place({
    lat: 36.5, lng: -89.6, state: "MO", totalNt: 50_000, dip: 66, decl: 1,
    volcanoKm: null, load: 2,
  });
  assert.equal(scoreAlignment(nm, nm.sunPhases).criteria.find((c) => c.id === "faults")!.fraction, 0);
});

test("Kruse's named regions add a scored criterion only where he names them", () => {
  const tx = place({ lat: 33, lng: -97, state: "TX", totalNt: 48_000, dip: 60, decl: 2.5, load: 2 });
  const ut = place({ lat: 33, lng: -97, state: "KS", totalNt: 48_000, dip: 60, decl: 2.5, load: 2 });
  assert.ok(scoreAlignment(tx, tx.sunPhases).criteria.some((c) => c.id === "named"));
  assert.ok(!scoreAlignment(ut, ut.sunPhases).criteria.some((c) => c.id === "named"));
});