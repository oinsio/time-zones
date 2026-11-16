// @build-zic-from-tzcode: the zone tools built from the code archive of the release
// Verifies FR1, FR2, FR3, FR5 of build-zic-from-tzcode.
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildZoneTools } from "../../../scripts/zoneRules/buildZoneTools.ts";
import { TZ_COORDINATOR_KEY_FINGERPRINT } from "../../../scripts/zoneRules/signing.ts";
import {
  createFakeFetch,
  createFakeProcessRunner,
  type FakeScenario,
} from "./compileFakes";
import { RELEASE, VALID_SCENARIO, VALID_STATUS } from "./compileWorld";

const OTHER_FINGERPRINT = "0000000000000000000000000000000000000000";
const DATA_ARCHIVE_FILE = "tzdata2026f.tar.gz";

let workDirectory: string;

beforeEach(async () => {
  workDirectory = await mkdtemp(join(tmpdir(), "build-zone-tools-"));
});

afterEach(async () => {
  await rm(workDirectory, { recursive: true, force: true });
});

async function build(scenario: FakeScenario) {
  const processes = createFakeProcessRunner(scenario);
  const downloads = createFakeFetch();
  const dataArchivePath = join(workDirectory, DATA_ARCHIVE_FILE);
  const toolsPromise = buildZoneTools(RELEASE, dataArchivePath, workDirectory, {
    runProcess: processes.runProcess,
    fetchRelease: downloads.fetchRelease,
  });
  return {
    toolsPromise,
    calls: processes.calls,
    urls: downloads.urls,
    dataArchivePath,
  };
}

describe("buildZoneTools", () => {
  it("returns the zic and zdump built inside the tools directory", async () => {
    const run = await build(VALID_SCENARIO);
    expect(await run.toolsPromise).toEqual({
      zicPath: join(workDirectory, "tools", "zic"),
      zdumpPath: join(workDirectory, "tools", "zdump"),
    });
  });

  it("downloads the code archive and its signature from the release address", async () => {
    const run = await build(VALID_SCENARIO);
    await run.toolsPromise;
    expect(run.urls).toEqual([
      "https://data.iana.org/time-zones/releases/tzcode2026f.tar.gz",
      "https://data.iana.org/time-zones/releases/tzcode2026f.tar.gz.asc",
    ]);
  });

  it("verifies, unpacks the code then the data into the tools directory, then runs make", async () => {
    const run = await build(VALID_SCENARIO);
    await run.toolsPromise;
    const toolsDirectory = join(workDirectory, "tools");
    expect(
      run.calls.map((call) => [call.command, ...call.args].join(" ")),
    ).toEqual([
      expect.stringMatching(/^gpg --batch --import /),
      expect.stringMatching(
        /--verify \S+tzcode2026f\.tar\.gz\.asc \S+tzcode2026f\.tar\.gz$/,
      ),
      `tar -xzf ${join(workDirectory, "tzcode2026f.tar.gz")} -C ${toolsDirectory}`,
      `tar -xzf ${run.dataArchivePath} -C ${toolsDirectory}`,
      `make -C ${toolsDirectory} zic zdump`,
    ]);
  });

  it("stops before unpacking when the code signature does not verify", async () => {
    const run = await build({
      ...VALID_SCENARIO,
      codeVerifyStatus: "[GNUPG:] BADSIG ED97E90E62AA7E34 Paul\n",
    });
    await expect(run.toolsPromise).rejects.toThrow("tzcode2026f.tar.gz");
    expect(run.calls.map((call) => call.command)).not.toContain("tar");
  });

  it("stops when the code signature is by another key and names both fingerprints", async () => {
    const run = await build({
      ...VALID_SCENARIO,
      codeVerifyStatus: VALID_STATUS.split(TZ_COORDINATOR_KEY_FINGERPRINT).join(
        OTHER_FINGERPRINT,
      ),
    });
    await expect(run.toolsPromise).rejects.toThrow(
      new RegExp(`${OTHER_FINGERPRINT}.*${TZ_COORDINATOR_KEY_FINGERPRINT}`),
    );
    expect(run.calls.map((call) => call.command)).not.toContain("make");
  });

  it("stops before make when the code archive names another release and names both", async () => {
    const run = await build({ ...VALID_SCENARIO, codeArchiveVersion: "2026e" });
    await expect(run.toolsPromise).rejects.toThrow(
      "The code archive's version file names 2026e, but 2026f was requested",
    );
    expect(run.calls.map((call) => call.command)).not.toContain("make");
  });

  it("stops when make fails and names its exit code and error text", async () => {
    const run = await build({
      ...VALID_SCENARIO,
      makeFailure: { exitCode: 2, stderr: "cc: not found" },
    });
    await expect(run.toolsPromise).rejects.toThrow(
      "make failed (exit 2): cc: not found",
    );
  });
});
