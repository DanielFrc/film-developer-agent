import { describe, expect, it } from "vitest";
import { randomId } from "./randomId";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("randomId", () => {
  it("returns a uuid-shaped string", () => {
    expect(randomId()).toMatch(UUID_PATTERN);
  });

  it("falls back when randomUUID is unavailable", () => {
    const original = globalThis.crypto.randomUUID;
    // @ts-expect-error test override
    globalThis.crypto.randomUUID = undefined;

    try {
      expect(randomId()).toMatch(UUID_PATTERN);
    } finally {
      globalThis.crypto.randomUUID = original;
    }
  });

  it("generates unique values", () => {
    const ids = new Set(Array.from({ length: 20 }, () => randomId()));
    expect(ids.size).toBe(20);
  });
});
