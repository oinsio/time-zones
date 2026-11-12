// Verifies FR3, FR4 of add-remote-zone-rules-updates: what only the fetch adapter does.
import { ZoneRulesSourceFailure } from "@/ports";
import {
  createFetchZoneRulesVersionSource,
  fetchZoneRulesVersionSource,
} from "./fetchZoneRulesVersionSource";

const BASE_URL = "/time-zones/";

const createSource = (fetchFile: typeof fetch) =>
  createFetchZoneRulesVersionSource({ baseUrl: BASE_URL, fetchFile });
const answerWith = (body: unknown) =>
  vi.fn(async () => new Response(JSON.stringify(body)));

describe("fetch zone rules version source", () => {
  it("should request the version file under the base path, revalidating the cache", async () => {
    const fetchFile = answerWith({ release: "2026g" });
    await createSource(fetchFile).fetchVersion();
    expect(fetchFile).toHaveBeenCalledWith(
      "/time-zones/zone-rules/version.json",
      { cache: "no-cache" },
    );
  });

  it("should request a release file under the base path without cache options", async () => {
    const fetchFile = answerWith({});
    await createSource(fetchFile).fetchRelease("2026g");
    expect(fetchFile).toHaveBeenCalledTimes(1);
    expect(fetchFile.mock.calls[0]).toEqual([
      "/time-zones/zone-rules/2026g.json",
    ]);
  });

  it("should answer REQUEST_FAILED when the request is rejected", async () => {
    const source = createSource(async () => {
      throw new TypeError("offline");
    });
    expect([
      await source.fetchVersion(),
      await source.fetchRelease("2026g"),
    ]).toEqual([
      ZoneRulesSourceFailure.REQUEST_FAILED,
      ZoneRulesSourceFailure.REQUEST_FAILED,
    ]);
  });

  it.each([[{}], [{ release: 5 }], [null], [[]]])(
    "should answer UNPARSABLE for a version file of %j",
    async (body) => {
      expect(await createSource(answerWith(body)).fetchVersion()).toBe(
        ZoneRulesSourceFailure.UNPARSABLE,
      );
    },
  );

  it("should keep only the release name of the version file", async () => {
    const source = createSource(
      answerWith({ release: "2026g", publishedAt: "2026-02-01T00:00:00.000Z" }),
    );
    expect(await source.fetchVersion()).toEqual({ release: "2026g" });
  });

  it("should request the app's base path by default", async () => {
    const fetchFile = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}"));
    await fetchZoneRulesVersionSource.fetchVersion();
    expect(fetchFile).toHaveBeenCalledWith(
      `${import.meta.env.BASE_URL}zone-rules/version.json`,
      { cache: "no-cache" },
    );
    fetchFile.mockRestore();
  });
});
