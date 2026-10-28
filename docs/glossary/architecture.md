# Glossary: Architecture

Layers, the data flow between them, and the test stand-ins. Decisions: ADR-0002 (layers), ADR-0004 (persistence), ADR-0008 (work bounds); overview in `docs/architecture/overview.md`. See [README](README.md) for the entry format.

- **Model** — pure TypeScript state, commands, reducer, selectors and invariants. It depends on no React, DOM, i18n or presenter. *Code:* `src/model/`. *Never:* domain layer (use "model"), store (the store holds the model state).
- **Command** — a serializable object with a `type` enum that asks the model for a change. *Code:* `LocationCommand`, `LocationCommandType`. *Never:* action (Redux sense), event.
- **Reducer** — the pure function that applies a command to the world clock state and returns a new state or a typed error. It never throws for expected failures. *Code:* `reduceLocations`.
- **Selector** — a memoized pure function from the state and the effective instant to view-agnostic values. *Code:* `getEffectiveInstant`, `getReferenceZone`, `getReferenceDay`.
- **Store** — the holder of the world clock state that runs the reducer and notifies subscribers only when the state object changes. *Code:* `createStore`.
- **Presenter** — the layer that turns model values into display data: formatting, localized strings, accessible names. *Code:* `src/presenter/`, `present*` functions. *Never:* view model, formatter (for the layer).
- **Controller** — React hooks and providers that connect the store, the ports and the views, and run side effects (ticks, writes, sync). *Code:* `src/controller/`.
- **Port** — an interface the model or controller needs from the outside world. *Code:* `src/ports/` (`CitySearch`, `LocationRepository`, `StorageAvailability`), and `Clock` in `@/lib/temporal`. *Never:* service, gateway.
- **Adapter** — an implementation of a port for one technology. *Code:* `src/adapters/`.
- **Repository** — the adapter that owns reading and writing one stored model (ADR-0004). Only repositories write to storage. *Code:* `LocationRepository`, `localStorageLocationRepository`.
- **Tab sync** — passing a changed location list to the other open tabs, through `BroadcastChannel` or `storage` events. *Never:* replication.
- **Work bound** — a deterministic count (formatters built, lookups, passes) that a performance requirement is checked by in unit tests, instead of measured time (ADR-0008). *Code:* `test/workCounters.ts`. *Never:* wall-clock budget in a unit test.
- **Fake clock** — the clock tests use, fixed at an instant and a zone. *Code:* `fakeClock`, `createSwitchableClock`. *Never:* `vi.setSystemTime`, `vi.useFakeTimers`.
- **Tick scheduler / write scheduler** — the injectable timers of the minute tick and the storage write, replaced by manual ones in tests. *Code:* `TickScheduler`, `WriteScheduler`, `createManualTickScheduler`, `createManualWriteScheduler`.
