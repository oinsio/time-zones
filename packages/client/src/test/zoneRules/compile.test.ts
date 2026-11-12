// @add-zone-rules-from-iana @FR7: compiling a release from a signed IANA archive
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { runZoneRulesCompile } from "../../../scripts/zoneRules/compile.ts";
import { TZDATA_SOURCE_FILES } from "../../../scripts/zoneRules/compileWithZic.ts";
import { TZ_COORDINATOR_KEY_FINGERPRINT } from "../../../scripts/zoneRules/signing.ts";
import {
  createFakeFetch,
  createFakeProcessRunner,
  type FakeScenario,
  VALID_VERIFY_STATUS_FILE,
} from "./compileFakes";

const RELEASE = "2026f";
const VALID_STATUS = readFileSync(VALID_VERIFY_STATUS_FILE, "utf8");
const OTHER_FINGERPRINT = "0000000000000000000000000000000000000000";
const VALID_SCENARIO: FakeScenario = {
  verifyStatus: VALID_STATUS,
  archiveVersion: RELEASE,
};

type Run = Awaited<ReturnType<typeof compile>>;

async function compile(scenario: FakeScenario, argv: string[] = [RELEASE]) {
  const processes = createFakeProcessRunner(scenario);
  const downloads = createFakeFetch();
  const writtenFiles = new Map<string, string>();
  const logLines: string[] = [];
  const exitCode = await runZoneRulesCompile({
    argv,
    runProcess: processes.runProcess,
    fetchRelease: downloads.fetchRelease,
    writeFile: async (path, text) => void writtenFiles.set(path, text),
    log: (line) => logLines.push(line),
  });
  return {
    exitCode,
    writtenFiles,
    logLines,
    calls: processes.calls,
    urls: downloads.urls,
  };
}

function logsMention(run: Run, text: string): boolean {
  return run.logLines.some((line) => line.includes(text));
}

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
      "Asia/Kolkata",
    ]);
    expect(document.zones["Asia/Calcutta"]).toBe("Asia/Kolkata");
    expect(document.zones["Asia/Calcutta2"]).toBe("Asia/Kolkata");
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

describe("a compile that must stop", () => {
  it.each([
    [
      "a missing VALIDSIG",
      {
        ...VALID_SCENARIO,
        verifyStatus: "[GNUPG:] BADSIG ED97E90E62AA7E34 Paul\n",
      },
      "signature",
    ],
    ["a failed key import", { ...VALID_SCENARIO, importExitCode: 2 }, "import"],
  ])(
    "stops on %s before zic, names the failed check and writes nothing",
    async (_description, scenario, checkName) => {
      const run = await compile(scenario);
      expect(run.exitCode).not.toBe(0);
      expect(logsMention(run, checkName)).toBe(true);
      expect(run.calls.some((call) => call.command === "zic")).toBe(false);
      expect(run.writtenFiles.size).toBe(0);
    },
  );

  it("stops when the signature is by another key and names both fingerprints", async () => {
    const otherKeyStatus = VALID_STATUS.split(
      TZ_COORDINATOR_KEY_FINGERPRINT,
    ).join(OTHER_FINGERPRINT);
    const run = await compile({
      ...VALID_SCENARIO,
      verifyStatus: otherKeyStatus,
    });
    expect(run.exitCode).not.toBe(0);
    expect(logsMention(run, OTHER_FINGERPRINT)).toBe(true);
    expect(logsMention(run, TZ_COORDINATOR_KEY_FINGERPRINT)).toBe(true);
    expect(run.calls.some((call) => call.command === "zic")).toBe(false);
    expect(run.writtenFiles.size).toBe(0);
  });

  it("stops when the version file names another release and names both", async () => {
    const run = await compile({ ...VALID_SCENARIO, archiveVersion: "2026e" });
    expect(run.exitCode).not.toBe(0);
    expect(logsMention(run, "2026e")).toBe(true);
    expect(logsMention(run, "2026f")).toBe(true);
    expect(run.calls.some((call) => call.command === "zic")).toBe(false);
    expect(run.writtenFiles.size).toBe(0);
  });

  it("stops when a download fails", async () => {
    const exitCode = await runZoneRulesCompile({
      argv: [RELEASE],
      runProcess: createFakeProcessRunner(VALID_SCENARIO).runProcess,
      fetchRelease: async () => {
        throw new Error("HTTP 404");
      },
      writeFile: async () => {
        throw new Error("must not write");
      },
      log: () => {},
    });
    expect(exitCode).not.toBe(0);
  });

  it("exits non-zero with a usage line when the release argument is missing", async () => {
    const run = await compile(VALID_SCENARIO, []);
    expect(run.exitCode).not.toBe(0);
    expect(logsMention(run, "Usage")).toBe(true);
    expect(run.urls).toEqual([]);
  });

  it.each([["latest"], ["2026"], ["../2026f"], ["2026F"]])(
    "rejects the release name %s",
    async (name) => {
      const run = await compile(VALID_SCENARIO, [name]);
      expect(run.exitCode).not.toBe(0);
      expect(run.urls).toEqual([]);
    },
  );
});
