import { describe, expect, it } from "vitest";
import { ElateApiError, ElateClient } from "../src";

describe("public exports", () => {
  it("exports the public client and error class", () => {
    expect(ElateClient).toBeTypeOf("function");
    expect(ElateApiError).toBeTypeOf("function");
  });
});
