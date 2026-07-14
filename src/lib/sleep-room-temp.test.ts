import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  pointsForSleepRoomTemp,
  FLOOR_SLEEP_ROOM_TEMP_F,
  parseSleepRoomTempF,
} from "./sleep-room-temp";

describe("pointsForSleepRoomTemp", () => {
  it("awards 10 points at 65°F and cooler", () => {
    assert.equal(pointsForSleepRoomTemp(65), 10);
    assert.equal(pointsForSleepRoomTemp(64), 10);
    assert.equal(pointsForSleepRoomTemp(60), 10);
  });

  it("diminishes by 1 point per degree above 65°F", () => {
    assert.equal(pointsForSleepRoomTemp(66), 9);
    assert.equal(pointsForSleepRoomTemp(67), 8);
    assert.equal(pointsForSleepRoomTemp(68), 7);
    assert.equal(pointsForSleepRoomTemp(70), 5);
    assert.equal(pointsForSleepRoomTemp(72), 3);
    assert.equal(pointsForSleepRoomTemp(74), 1);
  });

  it("floors at configured optimal temp", () => {
    assert.equal(FLOOR_SLEEP_ROOM_TEMP_F, 65);
    assert.equal(pointsForSleepRoomTemp(FLOOR_SLEEP_ROOM_TEMP_F), 10);
  });
});

describe("parseSleepRoomTempF", () => {
  it("clamps values below 65°F up to 65°F", () => {
    assert.equal(parseSleepRoomTempF(58), 65);
    assert.equal(parseSleepRoomTempF(64), 65);
  });
});
