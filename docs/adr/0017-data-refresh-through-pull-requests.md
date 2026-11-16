# ADR-0017: Data refresh through pull requests

## Status
Accepted (2026-11-16)

Refines [ADR-0014](0014-zone-rules-from-iana.md) point 5 and [ADR-0015](0015-city-data-from-geonames.md). Driven by `refresh-data-through-scheduled-pull-requests`.

## Context

The app carries three kinds of committed data that change after a release: the zone rules (IANA), the city data (GeoNames) and the names of the zone cities (CLDR). Development is close to its end, so no weekly release will carry fresh data. `main` accepts changes only through pull requests, so a workflow that pushes a release to `main` (ADR-0014 point 5) cannot run, and the city data and CLDR were refreshed by hand. Related: ADR-0014, ADR-0015.

## Decision

Committed data reaches `main` only through data refresh pull requests, one per source (zone rules, city data, CLDR), opened by the data refresh bot, a GitHub App with only the permissions to write contents and pull requests, so that the checks of its pull requests start without approval and its merge starts the ordinary deploy.

Before a pull request is opened, a refresh guard compares the refreshed data with the committed data. A refresh that loses something (more than 1% of the cities, a city of a million inhabitants, a zone, a zone identifier or zone coordinates) is labelled `needs-review` and waits for a human. Any other refresh merges by itself, as a squash commit whose message ends with the trailer `Data-Only: true`, once every required check passed. A pull request check fails when a data refresh branch changes a path outside the data paths of its source. A failed refresh opens one issue per source. A repository variable, `DATA_REFRESH_ENABLED`, switches the data refresh on.

## Consequences

Positive:
- `main` stays protected; every data change is checked by the same checks as code.
- The trailer lets the app and the deploy tell a data-only release from a code release.
- A refresh that looks wrong waits for a human instead of shipping.

Negative:
- A GitHub App and two secrets must be kept.
- GitHub disables scheduled workflows after 60 days without activity; the daily zone rules publication re-enables them.

## Alternatives Considered

**Push to `main` with a protection bypass**: the shape of `add-remote-zone-rules-updates`; rejected, it weakens the protection of `main`.
**`GITHUB_TOKEN` for the pull request**: its pull request checks wait for approval and its merge starts no deploy.
**A personal access token**: ties the automation to a person.
**Renovate instead of Dependabot**: no bot is configured today; Dependabot needs no installation.
