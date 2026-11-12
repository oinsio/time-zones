// FR10: the release is fetched, parsed and installed; a failure installs nothing.
// @add-zone-rules-from-iana @FR10
import { afterEach, describe, expect, it, vi } from "vitest";
import { createInMemoryStoredReleaseRepository } from "@/adapters/storedRelease";
import { FIXTURE_RELEASE_DOCUMENT } from "@/test/zoneRules/fixtureReleaseDocument";
import { ZoneRulesReleaseError } from "./core";
import * as installModule from "./installZoneRules";
import { loadZoneRules } from "./loadZoneRules";

const RELEASE_URL = "/assets/zone-rules-abc.json";

afterEach(() => {
  vi.restoreAllMocks();
});

function stubFetch(response: Partial<Response>) {
  return vi.fn(async () => response as Response);
}

const load = (fetchRelease: typeof fetch) =>
  loadZoneRules(RELEASE_URL, {
    storedReleases: createInMemoryStoredReleaseRepository(),
    fetchRelease,
  });

describe("loadZoneRules", () => {
  it("should request the release url", async () => {
    vi.spyOn(installModule, "installZoneRulesDateTimeFormat").mockReturnValue();
    const fetchRelease = stubFetch({
      ok: true,
      json: async () => FIXTURE_RELEASE_DOCUMENT,
    });

    await load(fetchRelease);

    expect(fetchRelease).toHaveBeenCalledWith(RELEASE_URL);
  });

  it("should install the parsed release", async () => {
    const installSpy = vi
      .spyOn(installModule, "installZoneRulesDateTimeFormat")
      .mockReturnValue();

    await load(
      stubFetch({ ok: true, json: async () => FIXTURE_RELEASE_DOCUMENT }),
    );

    expect(installSpy).toHaveBeenCalledTimes(1);
  });

  it("should reject and install nothing when the response is not ok", async () => {
    const installSpy = vi.spyOn(
      installModule,
      "installZoneRulesDateTimeFormat",
    );

    await expect(load(stubFetch({ ok: false, status: 404 }))).rejects.toThrow(
      RELEASE_URL,
    );

    expect(installSpy).not.toHaveBeenCalled();
  });

  it("should reject with the typed error and install nothing for an invalid document", async () => {
    const installSpy = vi.spyOn(
      installModule,
      "installZoneRulesDateTimeFormat",
    );

    await expect(
      load(stubFetch({ ok: true, json: async () => ({ nope: true }) })),
    ).rejects.toBeInstanceOf(ZoneRulesReleaseError);

    expect(installSpy).not.toHaveBeenCalled();
  });

  it("should reject when the request fails", async () => {
    const networkError = new Error("offline");

    await expect(
      load(async () => {
        throw networkError;
      }),
    ).rejects.toBe(networkError);
  });
});
