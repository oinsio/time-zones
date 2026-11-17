# ADR-0018: Silent data updates and the app revision

## Status
Accepted (2026-11-17)

Refines point 5 of [ADR-0014](0014-zone-rules-from-iana.md) ("offers a reload") and builds on [ADR-0017](0017-data-refresh-through-pull-requests.md). Driven by `apply-data-updates-silently`.

## Context

ADR-0017 makes every data refresh (zone rules, city data, CLDR names) a data-only commit that is deployed on its own. Each deploy gives the service worker a new precache, so every open installation showed the update notice for a change the user could not see. The notice asks for a reload, and a reload of one window does not even switch builds: the old worker keeps the client until every window was closed.

What the environment offers:

- With `registerType: "prompt"` a new worker installs, precaches and waits. The browser activates it once no window is controlled by the old worker, so the first start after every window was closed runs the new build. Nothing in the project changes that.
- The page cannot ask a waiting worker which app it holds without a custom worker.
- A data-only commit carries the trailer `Data-Only: true` (ADR-0017); it changes only committed data.

## Decision

1. **The app revision** identifies the app of a build: the newest commit of the built history without the data-only trailer, or an explicit `APP_REVISION`. When the history cannot be read, or every commit the build sees is data-only, the build takes a value unique to it (an update notice, never a wrong silence). It is fixed into the code and published as `app-revision.json`, outside the precache.
2. **The update notice** is shown only when a build is waiting and the app revision of the site differs from the running build's. The page reads the file when a build becomes waiting and at each update recheck while one waits, online only, revalidating the HTTP cache. A build with the running build's app revision is a **silent update**: no notice, and the browser activates it at the next start. The page never calls skip-waiting for it and never switches builds while open.
3. **The zone rules update notice** is shown only when the stored release changes the rules of a watched zone (a zone of the list or the device time zone) from the comparison instant on. A release that changes no watched zone is stored silently and is active at the next start.
4. **The reload actions** of both notices switch to a waiting build, shown or silent.
5. **CI gives the build its history**: the `check` job fetches the full history, so the published build finds the newest commit without the trailer.

## Consequences

Positive:
- A data refresh no longer interrupts anyone; the app change notice means an app change.
- No new service worker code, no new timer; one small file is read while a build waits.
- A later human version number is `APP_REVISION=1.4.0`, without a change of the client.

Negative:
- A commit that changes code but carries `Data-Only: true` reaches users without a notice. The path check of ADR-0017 guards the trailer.
- A past correction of a watched zone stays unannounced; the next start uses the release in every case.
- An installed app that is never closed keeps the old data.

## Alternatives Considered

**A custom service worker (`injectManifest`) that answers a message with its revision**: replaces the generated worker and its tests for one string.

**A list of data paths** (`git log -- ':!city-data' ':!zone-rules'`): the CLDR names arrive through `pnpm-lock.yaml`, which is not a data path, and a path list errs silently where the trailer errs towards a notice.

**Skip-waiting without a reload**: the old page keeps running old code while the precache of the old build is cleaned up, and its lazy chunks fail to load.
