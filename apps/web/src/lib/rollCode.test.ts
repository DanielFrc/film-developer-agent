import { describe, expect, it } from "vitest";
import { developerToken, filmToken, suggestRollCode } from "./rollCode";

describe("filmToken", () => {
  it("abbreviates kentmere 400", () => {
    expect(filmToken("kentmere 400")).toBe("K400");
  });

  it("abbreviates rollei retro 400s", () => {
    expect(filmToken("rollei retro 400s")).toBe("RR400S");
  });
});

describe("developerToken", () => {
  it("abbreviates rodinal", () => {
    expect(developerToken("rodinal")).toBe("RODI");
  });

  it("abbreviates d-76", () => {
    expect(developerToken("d-76")).toBe("D76");
  });
});

describe("suggestRollCode", () => {
  it("builds a dated code", () => {
    expect(
      suggestRollCode({
        film: "kentmere 400",
        developer: "rodinal",
        developedAt: new Date(2026, 5, 19),
      }),
    ).toBe("260619-K400-RODI");
  });
});
