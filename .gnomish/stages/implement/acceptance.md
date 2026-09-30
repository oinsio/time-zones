# Acceptance criteria for the implement stage

- The code implements the one active OpenSpec change under `openspec/changes/`
  that the previous stage produced: every requirement in its spec deltas is
  realised, and every task in its `tasks.md` is done and ticked.
- The change does what the task asked, and nothing more — no scope the specs do
  not call for.
- Every behaviour the change adds or alters is covered by an automated test
  under `packages/client/src/`: Vitest specs for logic, a `.feature` file with
  step definitions for each Gherkin scenario the change introduces, axe-core
  assertions where the proposal carries an accessibility requirement. Tests
  assert behaviour, not implementation details; time is mocked with
  `fakeClock`, never `vi.useFakeTimers()` or `vi.setSystemTime()`.
- Traceability: new modules, components and tests reference the requirement
  they implement (`Implements FR-X of <change-name>`, `@<change-name> @FRx`
  scenario tags).
- The project's domain and code rules hold in the new code: IANA identifiers
  rather than raw offsets, Temporal rather than `Date`, no hardcoded numbers or
  string literals where a constant or enum belongs, descriptive names, imports
  only through a module's `index.ts`, the model/presenter/view layering from
  `.claude/rules/architecture.md`, user-facing text through i18n in every
  locale.
- UI the change adds handles its loading, error, empty and offline states, not
  only the happy path.
- Code style matches the surrounding code.

Judge by reading the source and the OpenSpec change only. You have no git: judge the files as they are now; what changed and what did not is already enforced by the command checks before you. Do not run
the build or the tests: lint, typecheck, unit tests, build, the bundle budget
and the BDD E2E suite have already run as separate checks before you, and their
green result is a precondition of your review, not part of it.
