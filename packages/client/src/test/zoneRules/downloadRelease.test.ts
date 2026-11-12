// @add-zone-rules-from-iana @FR7: the download of a release over Node fetch
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchBytes,
  getArchiveFileName,
  IANA_RELEASES_URL,
} from "../../../scripts/zoneRules/downloadRelease.ts";

describe("fetchBytes", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the bytes of a successful response", async () => {
    const fetchStub = vi.fn(async () => new Response(Uint8Array.of(1, 2, 3)));
    vi.stubGlobal("fetch", fetchStub);
    expect(await fetchBytes("https://example.test/a")).toEqual(
      Uint8Array.of(1, 2, 3),
    );
    expect(fetchStub).toHaveBeenCalledWith("https://example.test/a");
  });

  it("rejects with the URL and the status of a failed response", async () => {
    vi.stubGlobal("fetch", async () => new Response("no", { status: 404 }));
    await expect(fetchBytes("https://example.test/missing")).rejects.toThrow(
      "Downloading https://example.test/missing failed: HTTP 404",
    );
  });
});

describe("the release address", () => {
  it("is the IANA releases directory and the archive is named after the release", () => {
    expect(IANA_RELEASES_URL).toBe(
      "https://data.iana.org/time-zones/releases/",
    );
    expect(getArchiveFileName("2026f")).toBe("tzdata2026f.tar.gz");
  });
});
