import { describe, expect, it } from "vitest";
import type { Objective, Resolution, Tactic } from "../src";

describe("objective and tactic response types", () => {
  it("models completion timestamps and nullable resolution details", () => {
    const resolution: Resolution = {
      wasSuccess: true,
      scale: 4,
      description: "Completed",
    };
    const objective: Objective = {
      id: 1,
      name: "Improve activation",
      organizationId: 10,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
      completedAt: "2026-03-31T12:00:00Z",
      resolution,
    };
    const tactic: Tactic = {
      id: 2,
      organizationId: 10,
      name: "Improve follow-up cadence",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
      completedAt: null,
      resolution: null,
    };

    expect(objective.resolution?.wasSuccess).toBe(true);
    expect(tactic.completedAt).toBeNull();
  });
});
