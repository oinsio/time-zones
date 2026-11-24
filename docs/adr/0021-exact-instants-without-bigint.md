# ADR-0021: Exact instants are two safe integers, without BigInt

## Status
Accepted (2026-11-23)

## Context
The Unix time converter reads and writes Unix times up to nanoseconds, so a fraction of nine digits must not lose precision. `Temporal.Instant` exposes nanoseconds only as a BigInt, and BigInt literals are a syntax error on the legacy engine of ADR-0009.

## Decision
An exact instant is `{ unixSeconds, nanoseconds }`, both safe integers, `0 ≤ nanoseconds ≤ 999999999`. No value of the converter is one number of nanoseconds. Digits are read and written by string slicing (the last 0, 3, 6 or 9 digits of a unit are the fraction; a negative value is floored towards the past). Zone math uses `Temporal.Instant.fromEpochMilliseconds`; the digits below the millisecond are appended as text. The range is exactly that of `Temporal.Instant`. A source scan test forbids BigInt in the sources.

## Consequences
Positive:
- One code path with the same digits on every engine.
- No dependency.

Negative:
- Parsing and formatting are our own code, covered by tests and mutation testing.

## Alternatives Considered
**BigInt behind feature detection, lower precision on iOS 12**: two code paths and two test sets, different results per device, and a literal that breaks the legacy build.

**`Temporal.Instant` as the holder**: reading nanoseconds back needs a BigInt.

**A decimal library**: a dependency for string slicing.
