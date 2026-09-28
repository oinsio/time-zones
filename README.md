# Time Zones

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

Cross-device PWA for world clock, time zone conversion and meeting planning. Client-only and offline-first — no account, no server, your data stays on your device.

## Contents

- [MVP Features](#mvp-features)
- [Localization](#localization)
- [Tech Stack](#tech-stack)
- [Development](#development)
- [License](#license)

## MVP Features

1. **Locations** — add and remove locations via search by city, country or time zone abbreviation (`EST`, `IST`). Each location is stored by its IANA identifier (`"Europe/Moscow"`), never by a raw UTC offset.
2. **Persistence** — the list of locations is saved on the device and restored on the next visit, fully offline.
3. **Home location** — optionally mark one location as home; every location shows its difference from it (`+3h`, `−5:30h`). Without home, differences are counted from the device time, which is always shown as the "Here" entry.
4. **Day-night comparison** — every location is a card with its time and a slider colored by its local time of day (night / morning / working hours / evening), with the day boundary marked.
5. **Time selection** — drag the slider or type a time in any location; all other locations are recalculated.
6. **Date selection** — pick a date; UTC offsets and daylight saving time are resolved for the selected date, not for today.
7. **12/24-hour format** — switch between 12-hour and 24-hour time.

## Localization

Russian and English are supported from the start. The locale system is built to be extended with new languages without code changes:

- **Auto-discovered locale files** — every `src/locales/<code>.json` is picked up automatically. Each file carries a `_meta` block (`code`, `name`, `nativeName`, `baseLanguage`, `emoji`); `_meta.code` must match the file name.
- **Adding a language** — drop a new locale file with a full set of keys; it appears in the language switcher.
- **Easter-egg dialects** — themed locales override only some keys of their `baseLanguage` and fall back to it for everything else, including plural rules.
- **Language detection** — on first visit the browser language is used (`en-US` → `en`); the user's choice is then persisted locally.

## Tech Stack

- React 18, TypeScript, Vite, Tailwind CSS
- Temporal API (`temporal-polyfill`) for all date/time math
- i18next + react-i18next
- PWA via `vite-plugin-pwa` (Workbox)
- Testing: Vitest, vitest-cucumber (BDD unit), playwright-bdd (BDD E2E), axe-core, Stryker (mutation)

## Development

Requires Node.js >= 20 and pnpm >= 9.

```bash
pnpm install
pnpm dev          # start dev server
pnpm build        # production build
pnpm preflight    # lint + typecheck + tests
```

Features are developed with [OpenSpec](openspec/): `/opsx:propose` → `/opsx:apply` → `/opsx:archive`.

## License

[Apache License 2.0](LICENSE)
