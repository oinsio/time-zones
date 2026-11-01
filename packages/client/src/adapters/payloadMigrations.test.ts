// Verifies FR8 of add-interface-language-selection (D2).
import { migratePayload } from "./payloadMigrations";

describe("migratePayload", () => {
  it("should return the payload as it is when it is current", () => {
    expect(migratePayload(2, { a: 1 }, 2, {})).toEqual({ a: 1 });
  });

  it("should apply each step from the stored version up to the current one", () => {
    const migrations = {
      1: (payload: unknown) => [...(payload as number[]), 2],
      2: (payload: unknown) => [...(payload as number[]), 3],
    };
    expect(migratePayload(1, [1], 3, migrations)).toEqual([1, 2, 3]);
  });

  it("should return undefined when a step is missing", () => {
    expect(
      migratePayload(1, [1], 3, { 1: (payload) => payload }),
    ).toBeUndefined();
  });
});
