// Verifies FR3, FR4 of add-remote-zone-rules-updates: one contract, every adapter.
import { ZoneRulesSourceFailure } from "@/ports";
import { createFetchZoneRulesVersionSource } from "./fetchZoneRulesVersionSource";
import { createInMemoryZoneRulesVersionSource } from "./inMemoryZoneRulesVersionSource";
import { describeZoneRulesVersionSourceContract } from "./zoneRulesVersionSource.contract";

describeZoneRulesVersionSourceContract("in-memory", {
  createSource: ({ version, release2026g }) =>
    createInMemoryZoneRulesVersionSource({
      version,
      releases: { "2026g": release2026g },
    }),
});

const respondTo = (answer: unknown | ZoneRulesSourceFailure) => {
  if (answer === ZoneRulesSourceFailure.REQUEST_FAILED) {
    return new Response("missing", { status: 404 });
  }
  if (answer === ZoneRulesSourceFailure.UNPARSABLE) {
    return new Response("<html>not json</html>", { status: 200 });
  }
  return new Response(JSON.stringify(answer), { status: 200 });
};

describeZoneRulesVersionSourceContract("fetch", {
  createSource: ({ version, release2026g }) =>
    createFetchZoneRulesVersionSource({
      baseUrl: "/",
      fetchFile: async (input) =>
        respondTo(
          String(input).endsWith("version.json") ? version : release2026g,
        ),
    }),
});
