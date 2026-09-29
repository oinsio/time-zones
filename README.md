# Time Zones

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

Cross-device PWA for world clock, time zone conversion and meeting planning. Client-only and offline-first — no account, no server, your data stays on your device.

**Live:** <https://oinsio.github.io/time-zones/> — installable to the home screen, works offline after the first visit.

## Contents

- [Screenshots](#screenshots)
- [MVP Features](#mvp-features)
- [Localization](#localization)
- [Tech Stack](#tech-stack)
- [Development](#development)
- [Deployment](#deployment)
- [Gnomish Factory](#gnomish-factory)
- [License](#license)

## Screenshots

The Cards view on phone and tablet. Details: [docs/design](docs/design/README.md).

<table>
  <tr>
    <td align="center"><img src="docs/design/screens/phone-light.png" alt="Phone, light theme" width="300"></td>
    <td align="center"><img src="docs/design/screens/phone-dark.png" alt="Phone, dark theme" width="300"></td>
  </tr>
  <tr>
    <td align="center">Light theme</td>
    <td align="center">Dark theme</td>
  </tr>
</table>

<img src="docs/design/screens/tablet-light.png" alt="Tablet, light theme" width="720">

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
pnpm --filter @time-zones/client preview   # serve the production build (with the service worker)
pnpm preflight    # lint + typecheck + tests
```

The app is served under `/time-zones/` in every mode (dev, preview, production), so open `http://localhost:<port>/time-zones/`. The base path is defined once in [`packages/client/app.config.ts`](packages/client/app.config.ts).

### Replacing the logo

All icons (favicon, Apple touch icon, 192/512 px and maskable manifest icons) are generated during the build from one image. To change the logo, replace [`packages/client/assets/app-icon-source.jpg`](packages/client/assets/app-icon-source.jpg) with a square image (at least 512×512 px) and run `pnpm build` — no other edits are needed. Padding and background of the maskable icon are set in [`packages/client/pwa-assets.config.ts`](packages/client/pwa-assets.config.ts).

Features are developed with [OpenSpec](openspec/): `/opsx:propose` → `/opsx:apply` → `/opsx:archive`.

## Deployment

- Every pull request runs [CI](.github/workflows/ci.yml): lint, typecheck, unit tests, production build, initial JS budget (150 KB gzipped), a check that the build left sources untouched, and the smoke E2E.
- Every push to `main` runs the same checks and, only if they pass, [deploys](.github/workflows/deploy.yml) the build to GitHub Pages. A failed check leaves the previous version live; rollback is a revert on `main`.

## Gnomish Factory

[Gnomish Factory](https://github.com/oinsio/gnomish-factory) runs AI agents ("gnomes") through a pipeline of declarative stages that live in this repository. Every stage ends in automated checks and an LLM judge; a stage that keeps failing escalates to a human instead of shipping. The whole setup lives in [`.gnomish/`](.gnomish/):

| Path             | What it is                                                                                                  |
|------------------|-------------------------------------------------------------------------------------------------------------|
| `config.yaml`    | tracker (GitHub issues of `oinsio/time-zones`), attempt limit, WIP limit, labels                            |
| `pipeline.yaml`  | stage order                                                                                                 |
| `stages/<name>/` | one stage: `stage.yaml` (executor, checks), `instructions.md` (the brief), `acceptance.md` (judge criteria) |
| `factory/`       | everything that launches the factory, next to the pipeline rather than part of it — see below               |

`factory/` holds:

| Path                | What it is                                                                       |
|---------------------|----------------------------------------------------------------------------------|
| `gnomish`           | wrapper script — the only way to run the factory here                            |
| `gnomish.env`       | this instance's settings: instance name, host binding, log and secrets locations |
| `gnomish.local.env` | optional personal overrides of `gnomish.env`, git-ignored                        |
| `gnomish.jar`       | the factory build, git-ignored, you put it there yourself                        |

The pipeline currently has one stage, **`specify`**: it turns a task into exactly one OpenSpec change under `openspec/changes/` — the same procedure as `/opsx:propose` — and writes nothing else. It is accepted only if there is exactly one active change, `openspec validate --changes --strict` passes, the proposal has the sections and requirement ids from [`.claude/rules/`](.claude/rules/), and the judge approves it against [`acceptance.md`](.gnomish/stages/specify/acceptance.md). Implementation (`/opsx:apply`) is still done by hand.

### One-time setup

1. **Java 25+ and the Claude Code CLI** (`claude`) on `PATH`.
2. **The jar.** Build it in a clone of the factory and copy it in:

   ```bash
   ./gradlew :bootstrap:bootJar   # in the gnomish-factory clone
   cp bootstrap/build/libs/bootstrap-*.jar <time-zones>/.gnomish/factory/gnomish.jar
   ```

3. **The OpenSpec CLI, installed globally**, at the version pinned in `package.json` (`1.13.2`). The gnome works in a worktree outside this clone (`~/.gnomish/worktrees/time-zones/<task>`) where `node_modules` does not exist:

   ```bash
   npm install -g @fission-ai/openspec@1.13.2   # or: brew install openspec
   openspec --version
   ```

4. **Secrets** — outside the clone, one file per secret, the file content is the bare value:

   ```bash
   mkdir -p ~/.gnomish/secrets/time-zones
   install -m 600 /dev/null ~/.gnomish/secrets/time-zones/github-token        # issues + labels read/write on this repo
   install -m 600 /dev/null ~/.gnomish/secrets/time-zones/claude-oauth-token  # optional, from `claude setup-token`
   ```

   Without `claude-oauth-token` the agent uses this machine's `claude` login.

### Running

The wrapper adds `--dir` (this project) and loads [`gnomish.env`](.gnomish/factory/gnomish.env): the instance name (`time-zones`), the host binding, the log directory. Change a setting there, in `gnomish.local.env`, in your shell (`GNOMISH_LOG_LEVEL=DEBUG .gnomish/factory/gnomish ...`) or with a flag (`--factory.instance-name=...`) — each outranks the one before it.

```bash
# One ad-hoc task, no tracker: branch gnomish/<task-id> in a worktree, the clone is not touched
.gnomish/factory/gnomish run --task="Add a meeting planner view"

# The same, but you play the gnome and the judge — a dry run of a stage you are editing
.gnomish/factory/gnomish run --task="..." --mode=in-place --interactive

# Tasks from GitHub issues: label an issue gnomish:ready, then
.gnomish/factory/gnomish take 42          # work that issue
.gnomish/factory/gnomish serve --drain    # work the whole ready queue, then exit

.gnomish/factory/gnomish status <task-id> # where a task is and what happened to it
```

Without `--base`, `run` reads `.gnomish/` from the working tree, so uncommitted edits to a stage take effect immediately. A finished task leaves a `gnomish/<task-id>` branch; squash-merge it so the round-by-round history stays on the branch. Logs: `~/.gnomish/logs/time-zones/gnomish.log`. Labels: `gnomish:ready` → `gnomish:working` → `gnomish:delivered`, or `gnomish:needs-human` when a task escalates.

> **Host mode.** There is no sandbox image for this project yet, so [`gnomish.env`](.gnomish/factory/gnomish.env) pins `FACTORY_BINDINGS_DEFAULT=host`: every gnome process runs on this machine as you, with access to your files and no network restrictions. Switching to the container binding needs a sandbox image with the OpenSpec CLI baked in, plus `FACTORY_SANDBOX_IMAGE` and `FACTORY_SANDBOX_EGRESSALLOWLIST`.

Full reference: the factory's [operator guides](https://github.com/oinsio/gnomish-factory/tree/main/docs/guides) (`operator-guide.md` for the tracker, `-run.md` for `run`, `-serve.md` for `serve`).

## License

[Apache License 2.0](LICENSE)
