// Verifies FR1–FR4 of replace-wall-clock-row-budgets-with-deterministic-checks (D2).
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { startWorkCount } from "./workCounters";

const ZONE = "Asia/Tokyo";
const OTHER_ZONE = "Europe/Paris";
const INSTANT = Temporal.Instant.from("2026-07-15T12:00:00Z");

describe("startWorkCount", () => {
  it("should count Intl.DateTimeFormat builds grouped by zone", () => {
    const count = startWorkCount();
    new Intl.DateTimeFormat("en", { timeZone: ZONE });
    new Intl.DateTimeFormat("en", { timeZone: ZONE });
    new Intl.DateTimeFormat("en", { timeZone: OTHER_ZONE });
    new Intl.DateTimeFormat("en");
    count.stop();

    expect(count.formatters()).toBe(4);
    expect(count.formattersByZone().get(ZONE)).toBe(2);
    expect(count.formattersByZone().get(OTHER_ZONE)).toBe(1);
  });

  it("should count Intl.DisplayNames builds", () => {
    const count = startWorkCount();
    new Intl.DisplayNames("en", { type: "region" });
    count.stop();

    expect(count.displayNames()).toBe(1);
  });

  it("should count Intl.Collator builds", () => {
    const count = startWorkCount();
    new Intl.Collator("en");
    count.stop();

    expect(count.collators()).toBe(1);
  });

  it("should count a toLocaleString call on a ZonedDateTime from @/lib/temporal", () => {
    const count = startWorkCount();
    INSTANT.toZonedDateTimeISO(ZONE).toLocaleString("en");
    count.stop();

    expect(count.formatters()).toBe(1);
  });

  it.each([
    ["Instant", () => INSTANT.toLocaleString("en")],
    [
      "PlainDate",
      () => Temporal.PlainDate.from("2026-07-15").toLocaleString("en"),
    ],
    ["PlainTime", () => Temporal.PlainTime.from("12:00").toLocaleString("en")],
    [
      "PlainDateTime",
      () =>
        Temporal.PlainDateTime.from("2026-07-15T12:00").toLocaleString("en"),
    ],
  ])("should count a toLocaleString call on %s", (_name, format) => {
    const count = startWorkCount();
    format();
    count.stop();

    expect(count.formatters()).toBe(1);
  });

  it("should count a getTimeZoneTransition call on a ZonedDateTime from @/lib/temporal", () => {
    const zoned = INSTANT.toZonedDateTimeISO("America/New_York");
    const count = startWorkCount();
    zoned.getTimeZoneTransition("next");
    count.stop();

    expect(count.transitionLookups()).toBe(1);
  });

  it("should count String#normalize calls", () => {
    const count = startWorkCount();
    "é".normalize("NFD");
    count.stop();

    expect(count.normalizations()).toBe(1);
  });

  it("should not count work done before it started or after stop", () => {
    new Intl.DateTimeFormat("en");
    const count = startWorkCount();
    count.stop();
    new Intl.DateTimeFormat("en");

    expect(count.formatters()).toBe(0);
  });

  it("should restore the original Intl constructors on stop", () => {
    const originals = [Intl.DateTimeFormat, Intl.DisplayNames, Intl.Collator];
    startWorkCount().stop();

    expect([Intl.DateTimeFormat, Intl.DisplayNames, Intl.Collator]).toEqual(
      originals,
    );
  });

  it("should keep instanceof working for a formatter built while counting", () => {
    const count = startWorkCount();
    const formatter = new Intl.DateTimeFormat("en");
    count.stop();

    expect(formatter instanceof Intl.DateTimeFormat).toBe(true);
  });

  it("should keep formatting like the original while counting", () => {
    const count = startWorkCount();
    const formatted = new Intl.DateTimeFormat("en", {
      timeZone: ZONE,
      hour: "2-digit",
      hourCycle: "h23",
    }).format(INSTANT.epochMilliseconds);
    count.stop();

    expect(formatted).toBe("21");
  });
});
