---
paths:
  - "packages/client/src/**/*.ts"
  - "packages/client/src/**/*.tsx"
---

# Rule: layered architecture — model, presenter, swappable views

Source of truth: `docs/architecture/overview.md`, ADR-0002, ADR-0003, ADR-0004.

**Model (`src/model/`, `src/preferences/`):**
- Pure TypeScript — never import React, the DOM, i18next, the presenter or adapters
- State changes only through command objects with a `type` enum and a pure reducer
- Expected failures are returned as typed errors, not thrown
- Read "now" only through the `Clock` port; never start timers
- Selectors return Temporal values, enums and numbers — never human-readable strings
- Memoize selectors so unchanged locations keep referential identity between clock ticks
- Keep invariants from `docs/architecture/domain-model.md` true after every command

**Presenter (`src/presenter/`):**
- The only layer that formats times and dates, applies i18n and the 12/24h preference

**Controller (`src/controller/`):**
- Maps UI events to commands; views never call the reducer or ports directly
- Owns side effects: clock tick on minute boundaries, pause on `visibilitychange`, persistence, cross-tab sync

**Views (`src/views/`):**
- Render presenter output and emit events only
- Keep view state (scroll, open panels, focus) local — never put it into the model
- Reuse `views/shared/` blocks instead of duplicating them per view
- Every view passes the shared view-contract BDD E2E scenarios

**Persistence:**
- Access storage only through repository ports; every adapter passes the shared contract tests
- Stored documents are `{ schemaVersion, payload }`; a schema change requires a migration and fixture tests
- Invalid stored data leads to a recoverable error state, never a crash
