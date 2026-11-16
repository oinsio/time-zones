// Verifies FR2 of show-clock-change-note-on-location-cards (D2).
import { describe, expect, it } from "vitest";
import { Temporal } from "@/lib/temporal";
import { findOffsetTransitions } from "./clockChange";

describe("findOffsetTransitions over a span", () => {
  const instantOf = (iso: string) => Temporal.Instant.from(iso);

  it("should find the Belgrade change inside a span with margin 0", () => {
    const transitions = findOffsetTransitions(
      "Europe/Belgrade",
      {
        start: instantOf("2026-10-24T22:00:00Z"),
        end: instantOf("2026-11-08T23:00:00Z"),
      },
      0,
    );

    expect(transitions.map((instant) => instant.toString())).toEqual([
      "2026-10-25T01:00:00Z",
    ]);
  });

  it("should include a transition exactly at the span start", () => {
    const transitions = findOffsetTransitions(
      "Europe/Belgrade",
      {
        start: instantOf("2026-10-25T01:00:00Z"),
        end: instantOf("2026-10-26T01:00:00Z"),
      },
      0,
    );

    expect(transitions.map((instant) => instant.toString())).toEqual([
      "2026-10-25T01:00:00Z",
    ]);
  });

  it("should exclude a transition exactly at the span end", () => {
    const transitions = findOffsetTransitions(
      "Europe/Belgrade",
      {
        start: instantOf("2026-10-24T01:00:00Z"),
        end: instantOf("2026-10-25T01:00:00Z"),
      },
      0,
    );

    expect(transitions).toEqual([]);
  });

  it("should reach the default margin beyond the span", () => {
    const span = {
      start: instantOf("2026-03-07T07:00:00Z"),
      end: instantOf("2026-03-08T05:00:00Z"),
    };

    expect(findOffsetTransitions("America/New_York", span)).toHaveLength(1);
    expect(findOffsetTransitions("America/New_York", span, 1)).toEqual([]);
  });
});
