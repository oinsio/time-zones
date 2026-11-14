// Verifies FR12 of add-geonames-city-source (D8): the dump download and the alternate names stream.
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  downloadDumps,
  readSelectedAlternateNames,
} from "../../../scripts/cityData/download.ts";
import type { RunProcess } from "../../../scripts/zoneRules/processTypes.ts";

let directory = "";
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "city-data-download-test-"));
});
afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

const unzipSucceeds: RunProcess = async () => ({
  exitCode: 0,
  stdout: "",
  stderr: "",
});

function alternateLine(id: number, language: string, name: string): string {
  return ["1", String(id), language, name, "1", "", "", "", "", ""].join("\t");
}

describe("readSelectedAlternateNames", () => {
  it("should keep only wanted IDs in English and Russian", async () => {
    const path = join(directory, "alternateNamesV2.txt");
    await writeFile(
      path,
      [
        alternateLine(10, "ru", "Казань"),
        alternateLine(10, "en", "Kazan"),
        alternateLine(10, "de", "Kasan"),
        alternateLine(11, "ru", "Чужой"),
      ].join("\n"),
    );
    const names = await readSelectedAlternateNames(path, new Set([10]));
    expect([...names.keys()]).toEqual([10]);
    expect(names.get(10)?.map((row) => row.name)).toEqual(["Казань", "Kazan"]);
  });

  it("should throw with the line number for a malformed kept line", async () => {
    const path = join(directory, "alternateNamesV2.txt");
    await writeFile(path, `${alternateLine(10, "ru", "Казань")}\n1\t10\tru\n`);
    await expect(
      readSelectedAlternateNames(path, new Set([10])),
    ).rejects.toThrow(/line 2/);
  });
});

describe("downloadDumps", () => {
  it("should fetch the three dumps from GeoNames and unzip the two archives", async () => {
    const urls: string[] = [];
    const commands: string[][] = [];
    const paths = await downloadDumps(
      async (url) => {
        urls.push(url);
        return Uint8Array.of(1);
      },
      async (command, args) => {
        commands.push([command, ...args]);
        return { exitCode: 0, stdout: "", stderr: "" };
      },
      directory,
    );
    expect(urls).toEqual([
      "https://download.geonames.org/export/dump/cities15000.zip",
      "https://download.geonames.org/export/dump/alternateNamesV2.zip",
      "https://download.geonames.org/export/dump/admin1CodesASCII.txt",
    ]);
    expect(commands.map(([command]) => command)).toEqual(["unzip", "unzip"]);
    expect(commands[0]).toEqual([
      "unzip",
      "-o",
      join(directory, "cities15000.zip"),
      "-d",
      directory,
    ]);
    expect(paths.citiesPath).toBe(join(directory, "cities15000.txt"));
    expect(paths.alternateNamesPath).toBe(
      join(directory, "alternateNamesV2.txt"),
    );
    expect((await readFile(paths.admin1Path)).length).toBe(1);
  });

  it("should throw naming the dump when a download fails", async () => {
    await expect(
      downloadDumps(
        async (url) => {
          if (url.endsWith("alternateNamesV2.zip")) throw new Error("HTTP 503");
          return Uint8Array.of(1);
        },
        unzipSucceeds,
        directory,
      ),
    ).rejects.toThrow(/alternateNamesV2\.zip.*HTTP 503/);
  });

  it("should throw naming the archive when unzip fails", async () => {
    await expect(
      downloadDumps(
        async () => Uint8Array.of(1),
        async () => ({ exitCode: 9, stdout: "", stderr: "bad zip" }),
        directory,
      ),
    ).rejects.toThrow(/cities15000\.zip.*bad zip/);
  });
});
