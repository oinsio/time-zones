// Verifies FR2, FR3, FR9 of add-locations-via-search (D7).
import { describe, expect, it } from "vitest";
import { POPULAR_TIME_ZONE_IDS } from "@/constants";
import { almaty, idsOf, moscow, utc } from "./zoneCitiesFixtures";
import { createZoneCitiesSource } from "./zoneCitiesSource";

describe("zone cities source records", () => {
  it("should build one record per listed zone joined with its names", () => {
    const source = createZoneCitiesSource([moscow, almaty], () => [
      "Europe/Moscow",
    ]);
    expect(source.records[0]).toMatchObject({
      id: "Europe/Moscow",
      timeZoneId: "Europe/Moscow",
      names: moscow.names,
      countryCode: "RU",
    });
  });

  it("should canonicalize and de-duplicate legacy identifiers", () => {
    const kyiv = {
      ...moscow,
      timeZoneId: "Europe/Kyiv",
      names: { en: "Kyiv", ru: "Киев" },
    };
    const source = createZoneCitiesSource([kyiv], () => [
      "Europe/Kiev",
      "Europe/Kyiv",
    ]);
    expect(idsOf(source)).toEqual(["Europe/Kyiv", "UTC"]);
  });

  it("should derive a name from the identifier when the data lacks the zone", () => {
    const source = createZoneCitiesSource([], () => [
      "America/Argentina/Buenos_Aires",
    ]);
    expect(source.records[0]).toMatchObject({
      names: { en: "Buenos Aires", ru: "Buenos Aires" },
      countryCode: "",
    });
  });

  it("should always include UTC", () => {
    const source = createZoneCitiesSource([moscow, utc], () => [
      "Europe/Moscow",
    ]);
    expect(idsOf(source)).toContain("UTC");
  });

  it("should not duplicate UTC when the list has it", () => {
    const source = createZoneCitiesSource([utc], () => ["UTC", "Etc/UTC"]);
    expect(idsOf(source)).toEqual(["UTC"]);
  });

  it("should use every data zone when the browser cannot list zones", () => {
    const source = createZoneCitiesSource([moscow, almaty], () => undefined);
    expect(idsOf(source)).toEqual(["Europe/Moscow", "Asia/Almaty", "UTC"]);
  });

  it("should use the browser zone list by default and drop data zones it lacks", () => {
    const source = createZoneCitiesSource([
      moscow,
      { ...moscow, timeZoneId: "Mars/Olympus_Mons" },
    ]);
    expect(idsOf(source)).toContain("Europe/Moscow");
    expect(idsOf(source)).not.toContain("Mars/Olympus_Mons");
  });

  it("should rank popular zones by distance from the end of the popular list", () => {
    const source = createZoneCitiesSource([moscow, almaty, utc], () => [
      "Europe/Moscow",
      "Asia/Almaty",
      "UTC",
    ]);
    const rankOf = (id: string) =>
      source.records.find((record) => record.id === id)?.rank;
    expect(rankOf("UTC")).toBe(POPULAR_TIME_ZONE_IDS.length);
    expect(rankOf("Europe/Moscow")).toBe(
      POPULAR_TIME_ZONE_IDS.length -
        POPULAR_TIME_ZONE_IDS.indexOf("Europe/Moscow"),
    );
  });

  it("should give an unpopular zone rank zero", () => {
    const source = createZoneCitiesSource(
      [{ ...almaty, timeZoneId: "Asia/Qyzylorda" }],
      () => ["Asia/Qyzylorda"],
    );
    expect(source.records[0]?.rank).toBe(0);
  });

  it("should list the abbreviations of a zone as aliases", () => {
    const source = createZoneCitiesSource([moscow], () => ["Europe/Moscow"]);
    expect(source.records[0]?.aliases).toEqual(["MSK"]);
  });
});
