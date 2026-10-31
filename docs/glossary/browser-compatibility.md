# Glossary: Browser compatibility

Which engines the app runs on and how it starts on the oldest one. Decision: ADR-0009. Specs: `openspec/specs/browser-compatibility/`. See [README](README.md) for the entry format.

- **Supported engine** — a browser engine the app is tested on: the latest Chrome, Firefox, Edge and Safari, and iOS Safari 12.5. *Not:* an engine older than iOS Safari 12.5 or without ES modules.
- **Legacy engine** — a supported engine that lacks a built-in the app relies on (`Array#at`, `ResizeObserver`, the zone data of IANA 2022b); in practice iOS Safari 12.5. *Code:* `needsLegacySupport`. *Never:* old browser, legacy browser.
- **Legacy support** — what runs before the app on a legacy engine: the polyfills, `ResizeObserver` and the legacy zone shim, in their own chunk. A modern engine never loads it. *Code:* `src/lib/legacy/`, `src/boot.ts`. *Never:* compat layer.
- **Legacy zone shim** — the wrapper of `Intl.DateTimeFormat` that retries a canonical zone the engine rejects under its legacy zone names. Stored identifiers stay canonical. *Code:* `src/lib/legacy/zoneShim.ts`. *Not:* the legacy zone name.
