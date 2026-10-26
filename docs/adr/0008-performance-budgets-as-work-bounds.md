# ADR-0008: Performance budgets as work bounds, timings in a non-blocking benchmark

## Status
Accepted (2026-10-26)

Introduced by the change `replace-wall-clock-row-budgets-with-deterministic-checks` (implements FR8 of replace-wall-clock-row-budgets-with-deterministic-checks).

## Context

NFR-P budgets ("50 rows in under 50 ms") were checked in unit BDD by timing the app's work with `performance.now()` and asserting `<= 50`. On GitHub Actions three of these scenarios failed the PR check: 114 ms, 118 ms and 52 ms, for work that takes about 22 ms on a developer machine. `ubuntu-latest` has few cores and `vitest run` runs all test files in parallel, so one wall-clock sample swings 5× with runner load. An earlier fix moved one budget off jsdom rendering, and it was red again one change later.

A red check from the runner, not from the code, blocks every merge and teaches contributors to rerun or raise limits. The regressions the budgets really guard against are discrete and countable: an `Intl` formatter built per row per call, colour stops recomputed on every presenting, every record normalized per query. One such case was found while investigating: `ZonedDateTime#toLocaleString` in `temporal-polyfill` builds a new `Intl.DateTimeFormat` on every call.

## Decision

- **Blocking checks count work, never time it.** Unit BDD budget scenarios wrap the counted block in `startWorkCount()` from `src/test/workCounters.ts` and assert bounds on formatter builds (`Intl.DateTimeFormat` and Temporal `toLocaleString`), `Intl.DisplayNames` and `Intl.Collator` builds, time zone transition lookups and `String#normalize` calls. Counters are test-scoped wrappers (`Proxy` construct traps and method spies on the `Temporal` from `@/lib/temporal`), not mocks of our own modules, and `stop()` restores the originals after each scenario.
- **No `performance.now()` in tests.** No file under `packages/client/src/` outside `src/test/benchmarks/` calls it, and no unit test or step compares a measured duration with a limit.
- **Real timings come from one place.** `*.bench.ts` files under `src/test/benchmarks/` run with `vitest bench` (`pnpm bench`) with warm-up and medians. `scripts/check-bench-budgets.mjs` compares each median with the 50 ms budget, writes a summary table and emits `::warning` lines, and always exits 0. In CI it runs in a separate `benchmark` job with `continue-on-error: true`, on its own runner, so it never blocks the PR check.
- **Cache guards are proven by mutation.** A scoped Stryker run over the cache files must show every cache-hit mutant killed by a feature scenario.

## Consequences
Positive:
- Budget checks are deterministic: a step fails only when the code does more work, on any machine and under any load.
- The checks catch the class of regression they guard (allocation per row, recompute per call) and point to it directly.
- Timings are still visible, as medians over warmed-up iterations, in one summary per PR.

Negative:
- A slowdown that does no extra counted work (for example a slower algorithm inside a cached path) passes the blocking check and only shows as a benchmark warning.
- Work inside `temporal-polyfill` or the JS engine is not counted; a dependency upgrade that drops its internal caches only shows in the benchmark.
- Counters patch globals for the duration of a scenario and rely on `stop()` running after it.

## Alternatives Considered
**Raise the limits or retry flaky timings**: rejected, the variance is 5× and grows with the test count; the check would still fail at random and stop catching real regressions.

**A separate Vitest project with `singleFork` for timing scenarios**: rejected, still blocking and still on a shared runner.

**Playwright with `performance.measure` in a real browser**: rejected as out of scope; it measures rendering, has the same runner variance and is much slower.

## Migration Path
Existing budget scenarios keep their names and tags and switch their steps to work counts. New changes with NFR-P requirements follow `.claude/rules/test-planning.md` and `.claude/rules/bdd-unit.md`: work bounds in unit BDD, timing in a `*.bench.ts` benchmark.
