import assert from "node:assert/strict";
import test from "node:test";
import { bedrockFromUnit, classifyBedrock, rockLabelFromLith } from "./bedrock";

test("reads the major rocks from a Macrostrat lithology string", () => {
  assert.equal(
    rockLabelFromLith("Major:{marlstone,chalk}, Minor:{claystone}"),
    "marlstone, chalk",
  );
  assert.equal(rockLabelFromLith("Lava flows; basalt"), "Lava flows, basalt");
});

test("sorts rock into the kinds the knowledge base comments on", () => {
  assert.equal(classifyBedrock("Puna Basalt lava flows"), "volcanic");
  assert.equal(classifyBedrock("Austin Chalk marlstone, chalk"), "carbonate");
  assert.equal(classifyBedrock("Loess silt"), "clay-delta");
  assert.equal(classifyBedrock("Biwabik Iron Formation"), "iron-rich");
  assert.equal(classifyBedrock("Manhattan Formation pelitic schist, gneiss"), "other");
});

test("builds a bedrock reading with an age range and a note only where one exists", () => {
  const chalk = bedrockFromUnit({
    name: "Austin Chalk",
    lith: "Major:{marlstone,chalk}, Minor:{claystone}",
    b_int_name: "Late Cretaceous",
    t_int_name: "Late Cretaceous",
  });
  assert.equal(chalk?.ageLabel, "Late Cretaceous");
  assert.equal(chalk?.kind, "carbonate");
  assert.ok(chalk?.note);

  const schist = bedrockFromUnit({
    name: "Manhattan Formation",
    lith: "Major:{pelitic schist,gneiss}",
    b_int_name: "Early Cambrian",
    t_int_name: "Middle Ordovician",
  });
  assert.equal(schist?.ageLabel, "Early Cambrian to Middle Ordovician");
  assert.equal(schist?.note, null);
});
