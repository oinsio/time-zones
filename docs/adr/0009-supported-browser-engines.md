# ADR-0009: Supported browser engines and boot-time polyfills

## Status
Accepted (2026-10-29)

## Context
The app must run on the latest Chrome, Firefox, Edge and Safari, and on iOS Safari 12.5, the last release for iPhone 5s/6 and iPad Air / mini 2–3. That engine has no optional chaining, no nullish coalescing, no lookbehind in regular expressions, no BigInt, no `Array#at`, no `ResizeObserver` and no `Intl.DisplayNames`, and its zone data predates the IANA 2022b renames (`Europe/Kyiv`). Modern browsers must not pay for this. Driven by `support-legacy-ios-12-safari`.

## Decision
- The supported engines are the latest evergreen browsers and iOS Safari 12.5. Older engines and engines without ES modules are not supported.
- Production syntax is lowered to the Safari 12 level. CI checks the built files (`check:legacy-build`).
- Built-ins that a legacy engine lacks are installed before any application module runs, in their own chunk (`installLegacySupport`). `bootApp` loads that chunk only when `needsLegacySupport` reports a missing built-in. A modern engine downloads none of it, and it does not count towards the initial JavaScript budget.
- Production code creates, reads and compares no BigInt values. Instants are compared and measured in milliseconds. A source scan enforces it.
- The legacy zone shim wraps `Intl.DateTimeFormat` so that a canonical zone the engine rejects is retried under its legacy names. Stored and compared identifiers stay canonical (ADR-0003). The shim is a stopgap under the "known limitation" of ADR-0003 and is removed once iOS Safari 12 leaves the supported engines.

## Consequences
Positive:
- Old phones and tablets run the app; modern engines are unaffected.
- The oldest supported level is checked on every build.

Negative:
- A second chunk, the shim and the BigInt ban constrain future code.
- Features without a fallback on iOS Safari 12 (dark theme, country names, smooth track dragging) stay unavailable there.

## Alternatives Considered
**Polyfill everything for every engine**: simple, but every modern user downloads the polyfills.

**Drop iOS Safari 12**: leaves the owner's devices unusable.

**Ship our own tzdata**: rejected by ADR-0003.
