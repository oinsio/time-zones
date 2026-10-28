# Glossary: Views

Interchangeable interfaces over the same model. Decisions: ADR-0002 (model, presenter, swappable views), ADR-0005 (view registry); catalog in `docs/architecture/views.md`. See [README](README.md) for the entry format.

- **View** — one interchangeable interface over the model, such as Cards or Grid. A view reads presented data and dispatches commands, and owns only its UI state (scroll, focus, open panels). *Not:* a page or a screen. *Never:* layout, mode (for the view itself), skin.
- **View registry** — the list of registered views with the minimum container width each needs. *Code:* `views/index.ts`, `resolveActiveView`.
- **View mode** — the user's choice of view: auto or a registered view. Auto picks the widest-fitting registered view for the container width. *Code:* `ViewMode` *(planned in preferences)*.
- **Cards view** — the view with one card per location, the exact time in large digits and a day track. *Code:* `CardsView`. *RU:* «Карточки».
- **Grid view** *(planned)* — the view with hour cells aligned across all locations, for planning.
- **Card** — how the Cards view shows one location row. *Not:* a location.
- **Shared block** — a building block every view reuses, implemented once in `views/shared/`: the date bar, the day track, the Here mark icon, the search. *Never:* common component (for these blocks).
- **View contract** — the BDD E2E scenarios every registered view must pass: select a time, select a date, return to now, add and remove a location, the Here mark, and all UI states. *Code:* `@view-contract` features.
