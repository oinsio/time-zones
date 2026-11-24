# ADR-0022: A tool page has its own view registry

## Status
Accepted (2026-11-23)

## Context
The converter must be able to change its interface as the main page does (ADR-0005), but a view of the main page is an interface over the location model, while the converter has other data and commands.

## Decision
Views stay in the views layer. `src/views/unixTimeConverter/` holds `ConverterViewId`, `ConverterViewDefinition { id, titleKey, icon, component }` and `converterViewRegistry`, not re-exported from `views/index.ts`. A view receives `{ converter, commands }`, renders presenter output and emits commands. `resolveActiveView` is generic over `{ id: string }` with the default id as an argument, so both registries share it. The model, presenter and views of the converter are modules of their own, imported only by the converter chunk.

## Consequences
Positive:
- Adding or removing a converter view is one registry entry.
- The initial JavaScript does not grow with the converter.

Negative:
- A second registry to know about.

## Alternatives Considered
**Registering the converter in `viewRegistry`**: a view is an interface over the location model of the main page.

**No registry until a second view exists**: adding and removing a view should be one entry from the start.
