// @add-zone-rules-from-iana @FR7: compiling a release from a signed IANA archive
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { TZDATA_SOURCE_FILES } from "../../../scripts/zoneRules/compileWithZic.ts";
import { compile, RELEASE, VALID_SCENARIO } from "./compileWorld";

describe("compiling a valid archive", () => {
  it("writes a release named after the request with the zones of the archive", async () => {
    const run = await compile(VALID_SCENARIO);
    expect(run.exitCode).toBe(0);
    const [[path, text]] = [...run.writtenFiles];
    expect(path).toBe("zone-rules/release.json");
    const document = JSON.parse(text as string);
    expect(document.release).toBe(RELEASE);
    expect(Object.keys(document.zones)).toEqual([
      "America/New_York",
      "Asia/Calcutta",
      "Asia/Calcutta2",
      "Asia/Calcutta3",
      "Asia/Kolkata",
    ]);
    expect(document.zones["Asia/Calcutta"]).toBe("Asia/Kolkata");
    expect(document.zones["Asia/Calcutta2"]).toBe("Asia/Kolkata");
    expect(document.zones["Asia/Calcutta3"]).toBe("Asia/Kolkata");
    expect(document.zones["America/New_York"].futureRule).toBe(
      "EST5EDT,M3.2.0,M11.1.0",
    );
  });

  it("downloads the archive and its signature from the release address, never a latest link", async () => {
    const run = await compile(VALID_SCENARIO);
    expect(run.urls).toEqual([
      "https://data.iana.org/time-zones/releases/tzdata2026f.tar.gz",
      "https://data.iana.org/time-zones/releases/tzdata2026f.tar.gz.asc",
    ]);
    expect(run.urls.some((url) => url.includes("-latest"))).toBe(false);
  });

  it("runs every gpg call with its own temporary GNUPGHOME", async () => {
    const run = await compile(VALID_SCENARIO);
    const gpgCalls = run.calls.filter((call) => call.command === "gpg");
    expect(gpgCalls).toHaveLength(2);
    const homes = gpgCalls.map((call) => call.env?.GNUPGHOME);
    expect(homes[0]).toBeTruthy();
    expect(homes[1]).toBe(homes[0]);
    expect(existsSync(homes[0] as string)).toBe(false);
  });

  it("imports the pinned key file and then verifies the signature of the archive", async () => {
    const run = await compile(VALID_SCENARIO);
    const [importCall, verifyCall] = run.calls.filter(
      (call) => call.command === "gpg",
    );
    expect(importCall?.args).toEqual([
      "--batch",
      "--import",
      "scripts/zoneRules/tz-coordinator-key.asc",
    ]);
    expect(verifyCall?.args.slice(0, 3)).toEqual([
      "--batch",
      "--status-fd",
      "1",
    ]);
    expect(verifyCall?.args[3]).toBe("--verify");
    expect(verifyCall?.args[4]).toMatch(/tzdata2026f\.tar\.gz\.asc$/);
    expect(verifyCall?.args[5]).toMatch(/tzdata2026f\.tar\.gz$/);
  });

  it("compiles with zic -b slim over the tzdata source files", async () => {
    const run = await compile(VALID_SCENARIO);
    const zicCall = run.calls.find((call) => call.command === "zic");
    expect(zicCall?.args.slice(0, 2)).toEqual(["-b", "slim"]);
    expect(zicCall?.args[2]).toBe("-d");
    expect(zicCall?.args.slice(4)).toEqual(
      TZDATA_SOURCE_FILES.map((file) =>
        expect.stringMatching(new RegExp(`${file}$`)),
      ),
    );
    expect(TZDATA_SOURCE_FILES).toEqual([
      "africa",
      "antarctica",
      "asia",
      "australasia",
      "europe",
      "northamerica",
      "southamerica",
      "etcetera",
      "backward",
    ]);
  });
});
