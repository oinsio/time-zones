// @add-zone-rules-from-iana @FR7: the download of a release over Node fetch
// Verifies FR1 of build-zic-from-tzcode.
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ArchiveKind,
  downloadRelease,
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
    expect(getArchiveFileName("2026f", ArchiveKind.DATA)).toBe(
      "tzdata2026f.tar.gz",
    );
  });

  it("names the code archive after the release", () => {
    expect(getArchiveFileName("2026f", ArchiveKind.CODE)).toBe(
      "tzcode2026f.tar.gz",
    );
  });
});

describe("downloadRelease", () => {
  it.each([
    [ArchiveKind.DATA, "tzdata2026f.tar.gz"],
    [ArchiveKind.CODE, "tzcode2026f.tar.gz"],
  ])(
    "downloads the %s archive and its signature from the release address",
    async (kind, archiveFileName) => {
      const directory = await mkdtemp(join(tmpdir(), "download-release-"));
      const requestedUrls: string[] = [];
      try {
        const { archivePath, signaturePath } = await downloadRelease(
          "2026f",
          kind,
          async (url) => {
            requestedUrls.push(url);
            return new TextEncoder().encode(url);
          },
          directory,
        );
        expect(requestedUrls).toEqual([
          `${IANA_RELEASES_URL}${archiveFileName}`,
          `${IANA_RELEASES_URL}${archiveFileName}.asc`,
        ]);
        expect(archivePath).toBe(join(directory, archiveFileName));
        expect(await readFile(signaturePath, "utf8")).toBe(
          `${IANA_RELEASES_URL}${archiveFileName}.asc`,
        );
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
    },
  );
});
