import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generateStrongPassword } from "./generate-password";
import { passwordSchema } from "./password";

describe("generateStrongPassword", () => {
  it("returns passwords that pass local policy", () => {
    for (let i = 0; i < 20; i++) {
      const pwd = generateStrongPassword();
      assert.equal(passwordSchema.safeParse(pwd).success, true);
      assert.equal(pwd.length, 16);
    }
  });

  it("respects custom length within bounds", () => {
    const pwd = generateStrongPassword(20);
    assert.equal(pwd.length, 20);
    assert.equal(passwordSchema.safeParse(pwd).success, true);
  });

  it("includes mixed character classes", () => {
    const pwd = generateStrongPassword();
    assert.match(pwd, /[a-z]/);
    assert.match(pwd, /[A-Z]/);
    assert.match(pwd, /[0-9]/);
    assert.match(pwd, /[!@#$%^&*\-_+=]/);
  });
});
