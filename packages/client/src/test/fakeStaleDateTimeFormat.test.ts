// FR1, FR5 of add-zone-rules-from-iana: the stale-engine fake behaves like an engine on old zone data
import { afterEach, describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import {
  createStaleDateTimeFormat,
  installStaleEngine,
  restoreEngine,
} from "./fakeStaleDateTimeFormat";

const ALMATY_INSTANT = Temporal.Instant.from(
  "2026-07-15T08:00:00Z",
).epochMilliseconds;
const HOUR_OPTIONS = {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
} as const;

describe("createStaleDateTimeFormat", () => {
  it("shows Almaty at UTC+6, as an engine with old zone data does", () => {
    const { staleDateTimeFormat } = createStaleDateTimeFormat();
    const formatter = new staleDateTimeFormat("en", {
      ...HOUR_OPTIONS,
      timeZone: "Asia/Almaty",
    });
    expect(formatter.format(ALMATY_INSTANT)).toBe("14:00");
  });

  it.each(["America/Ciudad_Juarez", "Europe/Kyiv", "europe/kyiv"])(
    "rejects %s with a RangeError",
    (zoneId) => {
      const { staleDateTimeFormat } = createStaleDateTimeFormat();
      expect(() => new staleDateTimeFormat("en", { timeZone: zoneId })).toThrow(
        RangeError,
      );
    },
  );

  it("delegates every other zone to the real engine", () => {
    const { staleDateTimeFormat } = createStaleDateTimeFormat();
    const formatter = new staleDateTimeFormat("en", {
      ...HOUR_OPTIONS,
      timeZone: "Asia/Tokyo",
    });
    expect(formatter.format(ALMATY_INSTANT)).toBe("17:00");
  });

  it("delegates a formatter without a zone", () => {
    const { staleDateTimeFormat } = createStaleDateTimeFormat();
    expect(
      new staleDateTimeFormat("en", HOUR_OPTIONS).resolvedOptions().locale,
    ).toBe("en");
  });

  it("logs every zone it was asked for, with its outcome", () => {
    const { staleDateTimeFormat, calls } = createStaleDateTimeFormat();
    new staleDateTimeFormat("en", { timeZone: "Asia/Almaty" });
    expect(
      () => new staleDateTimeFormat("en", { timeZone: "Europe/Kyiv" }),
    ).toThrow();
    new staleDateTimeFormat("en");
    expect(calls).toEqual([
      { timeZone: "Asia/Almaty", isRejected: false },
      { timeZone: "Europe/Kyiv", isRejected: true },
      { timeZone: undefined, isRejected: false },
    ]);
  });

  it("keeps instanceof and supportedLocalesOf of the real engine", () => {
    const { staleDateTimeFormat } = createStaleDateTimeFormat();
    expect(new staleDateTimeFormat("en") instanceof Intl.DateTimeFormat).toBe(
      true,
    );
    expect(staleDateTimeFormat.supportedLocalesOf(["en"])).toEqual(["en"]);
  });
});

describe("installStaleEngine", () => {
  afterEach(() => restoreEngine());

  it("replaces Intl.DateTimeFormat until the engine is restored", () => {
    const wrapperBefore = Intl.DateTimeFormat;
    const { staleDateTimeFormat } = installStaleEngine();
    expect(Intl.DateTimeFormat).toBe(staleDateTimeFormat);
    restoreEngine();
    expect(Intl.DateTimeFormat).toBe(wrapperBefore);
  });

  it("restores the constructor of before the first install, however often it was installed", () => {
    const wrapperBefore = Intl.DateTimeFormat;
    installStaleEngine();
    installStaleEngine({ staleZones: {}, rejectedZones: [] });
    restoreEngine();
    expect(Intl.DateTimeFormat).toBe(wrapperBefore);
  });

  it("does nothing when no engine was installed", () => {
    const before = Intl.DateTimeFormat;
    restoreEngine();
    expect(Intl.DateTimeFormat).toBe(before);
  });
});
