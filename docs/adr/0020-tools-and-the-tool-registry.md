# ADR-0020: Tools are a registry; a tool page is a page of the shell

## Status
Accepted (2026-11-23)

## Context
The app grows small utilities beside the world clock, the first being the Unix time converter. Each one needs a switch in the settings, a header button and a page, and none of them may weigh on the first load. Adding a tool must not change the preferences type, the parser or the shell.

## Decision
- `src/tools/` is a shell module beside `app/`. It holds `ToolId`, `ToolDefinition { id, titleKey, icon, page? }` and `toolRegistry`, in the shape of `viewRegistry`; `page` is a lazy component.
- `Preferences.enabledTools` stores the ids of the enabled tools as texts (default `[]`, command `TOGGLE_TOOL`, schema version 9). `resolveEnabledTools(registry, enabledTools)` returns the registered enabled tools in registry order and ignores the rest, so a removed tool needs no migration and a tool stored by a newer build survives an older one.
- A tool page is a third kind of shell page (`AppPage.TOOL`) beside the main and settings pages. `useAppPage` owns the page state, Esc and the returned focus; `ToolButtons` renders one button per enabled tool with a page; `ToolHost` loads the page on demand inside an error boundary with a skeleton.
- The tools group of the settings is the toggle group with icon-only options.

## Consequences
Positive:
- A new tool is one registry entry and one lazy page; the initial JavaScript holds only the registry and icons.
- The preferences module does not import `tools/`.

Negative:
- A stored id of a tool that is not registered stays in the document, unused.
- Rolling back to a build of schema version 8 treats the version 9 document as unreadable (ADR-0004): the app runs on default preferences and offers the reset, until the version 9 build returns.

## Alternatives Considered
**A boolean field per tool**: every tool would change the preferences type, the parser and a migration.

**`ToolId` in the preferences type**: `preferences/` would import `tools/`; `viewMode` stores a text for the same reason.

**URL routes for tool pages**: the settings page is shell state; a second mechanism for one page is not justified.
