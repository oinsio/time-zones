// Verifies FR14 of add-geonames-city-source (D1, D5): the search data served by the plugin.
import { describe, expect, it } from "vitest";
import { zoneDataPlugin } from "../../../scripts/zoneData/zoneDataPlugin.ts";

type Hooks = {
  configResolved: (config: unknown) => void;
  resolveId: (source: string) => string | undefined;
  load: (resolvedId: string) => string | undefined;
};

function loadZoneCitiesModule(): string {
  const hooks = zoneDataPlugin() as unknown as Hooks;
  hooks.configResolved({
    command: "serve",
    mode: "test",
    base: "/",
    root: process.cwd(),
  });
  const resolvedId = hooks.resolveId("virtual:zone-cities") as string;
  return hooks.load(resolvedId) as string;
}

describe("zoneDataPlugin virtual:zone-cities", () => {
  it("should keep the zone cities as the default export", () => {
    expect(loadZoneCitiesModule()).toMatch(/^export default \[\{"timeZoneId":/);
  });

  it("should add the named cityData export", () => {
    expect(loadZoneCitiesModule()).toContain("export const cityData = {");
  });

  it("should serve the city data without its source record", () => {
    expect(loadZoneCitiesModule()).not.toContain('"licence"');
  });
});
