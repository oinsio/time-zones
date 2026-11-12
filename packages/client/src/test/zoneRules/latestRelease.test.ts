// @add-remote-zone-rules-updates @FR1: which IANA release the publication compiles
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  findNewestListedRelease,
  findReleaseToPublish,
  runLatestRelease,
} from "../../../scripts/zoneRules/latestRelease.ts";

const LISTING = `
<a href="tzcode2026ab.tar.gz">tzcode2026ab.tar.gz</a>
<a href="tzdata2026f.tar.gz">tzdata2026f.tar.gz</a>
<a href="tzdata2026f.tar.gz.asc">tzdata2026f.tar.gz.asc</a>
<a href="tzdata2026z.tar.gz">tzdata2026z.tar.gz</a>
<a href="tzdata2026z.tar.gz.asc">tzdata2026z.tar.gz.asc</a>
<a href="tzdata2026aa.tar.gz">tzdata2026aa.tar.gz</a>
<a href="tzdata2026aa.tar.gz.asc">tzdata2026aa.tar.gz.asc</a>
`;
const LISTING_WITHOUT_AA = LISTING.replace(/2026aa/g, "2026a");
const LISTING_UP_TO_F = `<a href="tzdata2026f.tar.gz">x</a><a href="tzcode2026g.tar.gz">y</a>`;
const LISTING_WITH_G = `${LISTING_UP_TO_F}<a href="tzdata2026g.tar.gz">z</a>`;

const temporaryDirectories: string[] = [];
afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("findNewestListedRelease", () => {
  it("should find the newest tzdata release by release order", () => {
    expect(findNewestListedRelease(LISTING)).toBe("2026aa");
  });

  it("should ignore tzcode and signature files", () => {
    expect(findNewestListedRelease(LISTING_UP_TO_F)).toBe("2026f");
  });

  it("should find nothing in a listing without tzdata", () => {
    expect(findNewestListedRelease("<html>nothing</html>")).toBeUndefined();
  });

  it("should still order z before aa when aa is missing", () => {
    expect(findNewestListedRelease(LISTING_WITHOUT_AA)).toBe("2026z");
  });
});

describe("findReleaseToPublish", () => {
  it.each([["2026f"], ["2026g"]])(
    "should publish nothing when the committed release %s is not older than the newest listed 2026f",
    (committed) => {
      expect(findReleaseToPublish(LISTING_UP_TO_F, committed)).toBeUndefined();
    },
  );

  it("should publish 2026g when 2026f is committed and 2026g is listed", () => {
    expect(findReleaseToPublish(LISTING_WITH_G, "2026f")).toBe("2026g");
  });

  it("should publish nothing for an empty listing", () => {
    expect(findReleaseToPublish("", "2026f")).toBeUndefined();
  });
});

describe("runLatestRelease", () => {
  const run = async (listing: string, committed: string) => {
    const directory = mkdtempSync(join(tmpdir(), "latest-release-"));
    temporaryDirectories.push(directory);
    const outputFile = join(directory, "github-output");
    const log = vi.fn();
    const exitCode = await runLatestRelease({
      fetchListing: async () => listing,
      readCommittedRelease: async () => committed,
      outputFile,
      log,
    });
    const output = (() => {
      try {
        return readFileSync(outputFile, "utf8");
      } catch {
        return undefined;
      }
    })();
    return { exitCode, output, log };
  };

  it("should write the release to the output file and print it", async () => {
    const { exitCode, output, log } = await run(LISTING_WITH_G, "2026f");
    expect(exitCode).toBe(0);
    expect(output).toBe("release=2026g\n");
    expect(log).toHaveBeenCalledWith("2026g");
  });

  it("should print already current and write nothing when nothing is newer", async () => {
    const { exitCode, output, log } = await run(LISTING_UP_TO_F, "2026f");
    expect(exitCode).toBe(0);
    expect(output).toBeUndefined();
    expect(log).toHaveBeenCalledWith("already current");
  });

  it("should not need an output file", async () => {
    const log = vi.fn();
    const exitCode = await runLatestRelease({
      fetchListing: async () => LISTING_WITH_G,
      readCommittedRelease: async () => "2026f",
      outputFile: undefined,
      log,
    });
    expect(exitCode).toBe(0);
    expect(log).toHaveBeenCalledWith("2026g");
  });

  it("should fail with a message when the listing cannot be fetched", async () => {
    const log = vi.fn();
    const exitCode = await runLatestRelease({
      fetchListing: async () => {
        throw new Error("HTTP 503");
      },
      readCommittedRelease: async () => "2026f",
      outputFile: undefined,
      log,
    });
    expect(exitCode).toBe(1);
    expect(log).toHaveBeenCalledWith(expect.stringContaining("HTTP 503"));
  });
});
