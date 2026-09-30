# Design: Add main page scaffold

## Context

Driven by FR1–FR10 of proposal.md. Current state: `AppShell` renders the title and `viewRegistry[0]` if present; the registry is empty and `ViewId` is an empty enum; `model` and `presenter` are empty; `controller` holds `useDocumentLanguage` and `usePwaUpdateStatus`. Global decisions already made: [ADR-0002](../../../docs/adr/0002-model-presenter-swappable-views.md) layers, [ADR-0005](../../../docs/adr/0005-view-registry.md) registry and AUTO rule. This change adds no ADR.

## Decisions

### D1. Pure `resolveActiveView` in `views/`
`resolveActiveView(registry, mode, containerWidth)` is a pure function exported from `views/index.ts`. It implements the ADR-0005 AUTO rule plus the fallback of FR2, so it is unit- and mutation-tested without React. `ViewMode` is `AUTO | ViewId`; the mode enum member lives next to `ViewId`.

### D2. Container width, not viewport width
The host measures its own content element with `ResizeObserver` in a controller hook `useContainerWidth(ref)`. ADR-0005 speaks of container width; measuring the element keeps the host valid if the page is later embedded. jsdom has no `ResizeObserver`, so tests inject a stub in `test/setup.ts`.

### D3. Page components stay in `app/`
`MainPage`, `ViewHost`, `ViewSkeleton`, `ViewErrorFallback`, `OfflineNote`, `StorageWarning` live in `src/app/` next to `AppShell` (they are shell, not views). `AppShell` keeps notices and hooks and renders `MainPage`. The view mode is a prop of `ViewHost` defaulting to `AUTO` until preferences exist (NG3).

### D4. Error isolation with an error boundary keyed for retry
`ViewHost` wraps the lazy view in a dedicated boundary, separate from the global `AppErrorBoundary`, so a view failure keeps the header and notices (FR6). Retry bumps a `key` on the boundary; a rejected lazy import is re-imported because `React.lazy` caches rejection, so the registry component is wrapped in a small factory that drops a failed promise on retry.

### D5. Connectivity and storage as controller hooks
`useOnlineStatus` reads `navigator.onLine` and listens to `online`/`offline` events. `useStorageAvailability` probes `localStorage` with a write/remove of a constant key from `constants/storage.ts` once on mount. Both are wrapped in hooks so the future persistence adapter can replace the probe without touching components.

### D6. Empty state is the Cards skeleton
`views/cards/CardsView.tsx` renders only the empty state text, because no model exists (NG1). It renders no action (Q1). Strings live under `mainPage.*` and `views.cards.*` keys.

### D7. Region slots are plain elements
Header controls and the bottom bar are empty landmark-free containers with stable `data-testid`-free structure; a later change fills them. No slot API is invented ahead of need.
