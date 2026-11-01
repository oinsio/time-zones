# Glossary

The normative dictionary of the project's ubiquitous language. If a term is here, code, specs, docs, translations and discussions use it with exactly this meaning and name. A domain type, port, field or translation that names a glossary concept differently is a bug. Terms are grouped by bounded context, and a term's definition holds within its context. The usage rules live in `.claude/rules/glossary.md`.

## How to read an entry

**Term** — definition. Optional parts:

- *RU:* — the Russian name used in the interface and in `locales/ru.json`.
- *Code:* — the type, enum or module that carries the concept.
- *Not:* — a boundary or a counter-example.
- *Never:* — banned synonyms that must not appear in code, specs, docs or translations.
- *(planned)* — the concept is decided in `docs/architecture/` but not implemented yet. Its name is already binding.

## Bounded contexts

| Context | File | What it covers |
|---|---|---|
| Time | [time.md](time.md) | the reference moment, zones, wall-clock time, offsets, the clock |
| Locations | [locations.md](locations.md) | the user's list of places, the Here mark, reorder |
| Time selection | [time-selection.md](time-selection.md) | the reference day, day tracks, day periods |
| Date selection | [date-selection.md](date-selection.md) | the date bar, the calendar, Now, DST notes |
| Search | [search.md](search.md) | finding a city and adding it as a location |
| Settings | [settings.md](settings.md) | the settings page, the theme preference, the hour format, the interface language, the locale registry |
| Browser compatibility | [browser-compatibility.md](browser-compatibility.md) | supported engines, legacy engines, legacy support, the legacy zone shim |
| Views | [views.md](views.md) | interchangeable interfaces over the model |
| App shell | [app-shell.md](app-shell.md) | notices, recovery, storage and offline states |
| Architecture | [architecture.md](architecture.md) | layers, ports, commands, test stand-ins |

## Abbreviations

| Abbreviation | Meaning |
|---|---|
| ADR | Architecture Decision Record (`docs/adr/`) |
| BDD | behaviour-driven development (Gherkin features, ADR-0001) |
| CLDR | Unicode Common Locale Data Repository, source of exemplar cities and zone aliases |
| DST | daylight saving time |
| E2E | end-to-end test in a real browser (playwright-bdd) |
| FR / NFR | functional / non-functional requirement (`.claude/rules/traceability.md`) |
| IA | information architecture (`docs/ia/`) |
| IANA | Internet Assigned Numbers Authority, keeper of the time zone database |
| ISO 8601 | the date and time format of stored timestamps (`2025-01-15T10:30:00.000Z`) |
| PRD | product requirements document (a change's `proposal.md`) |
| PWA | progressive web app |
| UTC | Coordinated Universal Time |
| UX | user-experience acceptance criterion |
