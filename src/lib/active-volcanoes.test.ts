import assert from "node:assert/strict";
import test from "node:test";
import {
  ACTIVE_VOLCANO_RADIUS_KM,
  isHawaii,
  nearestActiveVolcano,
} from "./active-volcanoes";
import { ACTIVE_SINCE_YEAR, ACTIVE_VOLCANOES } from "./active-volcanoes.data";

test("catalog holds only volcanoes active since the cutoff, including Kruse's Ilopango", () => {
  assert.ok(ACTIVE_VOLCANOES.length > 0);
  for (const volcano of ACTIVE_VOLCANOES) {
    assert.ok(volcano.lastEruptionYear >= ACTIVE_SINCE_YEAR, volcano.name);
  }
  assert.ok(ACTIVE_VOLCANOES.some((volcano) => volcano.name === "Ilopango"));
  assert.ok(!ACTIVE_VOLCANOES.some((volcano) => volcano.name.startsWith("Carrizozo")));
});

test("Frisco, Texas has no active volcano within range", () => {
  assert.equal(nearestActiveVolcano(33.15, -96.82), null);
});

test("Portland, Oregon finds a Cascade volcano within range", () => {
  const nearest = nearestActiveVolcano(45.52, -122.68);
  assert.ok(nearest);
  assert.ok(nearest.distanceKm <= ACTIVE_VOLCANO_RADIUS_KM);
  assert.equal(nearest.country, "United States");
});

test("Hilo finds Kilauea and is flagged as Hawaii", () => {
  const nearest = nearestActiveVolcano(19.72, -155.08);
  assert.ok(nearest);
  assert.ok(["Kilauea", "Mauna Loa"].includes(nearest.name), nearest.name);
  assert.ok(isHawaii(19.72, -155.08));
  assert.ok(!isHawaii(45.52, -122.68));
});
