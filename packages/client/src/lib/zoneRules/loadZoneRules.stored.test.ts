// @add-remote-zone-rules-updates @FR6, NFR-P2: the active release at start
import { afterEach, describe, expect, it, vi } from "vitest";
import { createInMemoryStoredReleaseRepository } from "@/adapters/storedRelease";
import { SaveOutcome, StoredReleaseLoadStatus } from "@/ports";
import { committedRelease } from "@/test/installZoneRules";
import {
  buildAlmatyReleaseDocument,
  buildReleaseDocument,
} from "@/test/zoneRules/buildReleaseDocument";
import {
  getInstalledRelease,
  installZoneRulesDateTimeFormat,
} from "./installZoneRules";
import { loadZoneRules } from "./loadZoneRules";

const RELEASE_URL = "/assets/zone-rules-abc.json";
const BUNDLED_DOCUMENT = buildAlmatyReleaseDocument("2026f", 5 * 3600);
const STORED_DOCUMENT = buildAlmatyReleaseDocument("2026g", 4 * 3600);
const ALMATY_NOON_UTC = Date.UTC(2026, 6, 15, 8);

const nativeDateTimeFormat = Intl.DateTimeFormat;

afterEach(() => {
  Intl.DateTimeFormat = nativeDateTimeFormat;
  installZoneRulesDateTimeFormat(committedRelease);
  Intl.DateTimeFormat = nativeDateTimeFormat;
});

const respondWith = (document: unknown) =>
  vi.fn(async () => ({ ok: true, json: async () => document }) as Response);
const failToRespond = () =>
  vi.fn(async () => {
    throw new Error("offline");
  });

const readAlmatyClock = () =>
  new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Almaty",
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(ALMATY_NOON_UTC);

describe("loadZoneRules with a stored release", () => {
  it("should install a stored release newer than the bundled one", async () => {
    const storedReleases = createInMemoryStoredReleaseRepository({
      initialDocument: STORED_DOCUMENT,
    });
    await loadZoneRules(RELEASE_URL, {
      storedReleases,
      fetchRelease: respondWith(BUNDLED_DOCUMENT),
    });
    expect(getInstalledRelease()?.release).toBe("2026g");
    expect(readAlmatyClock()).toBe("12:00");
  });

  it.each(["2026e", "2026f"])(
    "should clear a stored %s and install the bundled release",
    async (storedName) => {
      const storedReleases = createInMemoryStoredReleaseRepository({
        initialDocument: buildReleaseDocument(storedName),
      });
      await loadZoneRules(RELEASE_URL, {
        storedReleases,
        fetchRelease: respondWith(BUNDLED_DOCUMENT),
      });
      expect(getInstalledRelease()?.release).toBe("2026f");
      expect(storedReleases.load().status).toBe(StoredReleaseLoadStatus.EMPTY);
    },
  );

  it("should clear an unreadable stored release and install the bundled one", async () => {
    const storedReleases = createInMemoryStoredReleaseRepository({
      initialDocument: { release: 5 },
    });
    await loadZoneRules(RELEASE_URL, {
      storedReleases,
      fetchRelease: respondWith(BUNDLED_DOCUMENT),
    });
    expect(getInstalledRelease()?.release).toBe("2026f");
    expect(storedReleases.load().status).toBe(StoredReleaseLoadStatus.EMPTY);
  });

  it("should install the stored release when the bundled one fails to load", async () => {
    await loadZoneRules(RELEASE_URL, {
      storedReleases: createInMemoryStoredReleaseRepository({
        initialDocument: STORED_DOCUMENT,
      }),
      fetchRelease: failToRespond(),
    });
    expect(getInstalledRelease()?.release).toBe("2026g");
  });

  it("should reject when the bundled release fails and nothing is stored", async () => {
    await expect(
      loadZoneRules(RELEASE_URL, {
        storedReleases: createInMemoryStoredReleaseRepository(),
        fetchRelease: failToRespond(),
      }),
    ).rejects.toThrow("offline");
  });

  it("should read the storage once and request only the bundled release", async () => {
    const storedReleases = createInMemoryStoredReleaseRepository();
    const load = vi.spyOn(storedReleases, "load");
    const fetchRelease = respondWith(BUNDLED_DOCUMENT);
    await loadZoneRules(RELEASE_URL, { storedReleases, fetchRelease });
    expect(load).toHaveBeenCalledTimes(1);
    expect(fetchRelease).toHaveBeenCalledTimes(1);
    expect(fetchRelease).toHaveBeenCalledWith(RELEASE_URL);
  });

  it("should not write to the storage when it keeps a newer stored release", async () => {
    const storedReleases = createInMemoryStoredReleaseRepository({
      initialDocument: STORED_DOCUMENT,
    });
    const clear = vi
      .spyOn(storedReleases, "clear")
      .mockReturnValue(SaveOutcome.SAVED);
    await loadZoneRules(RELEASE_URL, {
      storedReleases,
      fetchRelease: respondWith(BUNDLED_DOCUMENT),
    });
    expect(clear).not.toHaveBeenCalled();
  });
});
