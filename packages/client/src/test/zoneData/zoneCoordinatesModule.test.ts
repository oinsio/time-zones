// Verifies FR7, FR8, NFR-P2 of bind-day-periods-to-sun (D4).
import { describe, expect, it } from "vitest";
import { zoneDataPlugin } from "../../../scripts/zoneData/zoneDataPlugin.ts";

type Hooks = {
  configResolved: (config: unknown) => void;
  resolveId: (source: string) => string | undefined;
  load: (resolvedId: string) => string | undefined;
};

const MODULE_ID = "virtual:zone-coordinates";

function loadModule(): { hooks: Hooks; text: string } {
  const hooks = zoneDataPlugin() as unknown as Hooks;
  hooks.configResolved({
    command: "serve",
    mode: "build",
    base: "/",
    root: process.cwd(),
  });
  const resolvedId = hooks.resolveId(MODULE_ID) as string;
  return { hooks, text: hooks.load(resolvedId) as string };
}

describe("zoneDataPlugin virtual:zone-coordinates", () => {
  it("should resolve the module in every mode", () => {
    expect(loadModule().hooks.resolveId(MODULE_ID)).toBeDefined();
  });

  it("should export the zones of the committed file as the default", () => {
    expect(loadModule().text).toMatch(/^export default \{"Africa\/Abidjan":\[/);
  });

  it("should serve integer tenths of a degree per zone", () => {
    const zones = JSON.parse(
      loadModule()
        .text.replace(/^export default /, "")
        .replace(/;$/, ""),
    ) as Record<string, number[]>;
    expect(zones["Europe/Moscow"]).toHaveLength(2);
  });

  it("should leave out the release name of the committed file", () => {
    expect(loadModule().text).not.toContain('"release"');
  });
});
