# Time Zones

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

[![en](https://img.shields.io/badge/lang-en-blue.svg)](README.md)
[![ru](https://img.shields.io/badge/lang-ru-red.svg)](README.ru.md)

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

Requires Node.js >= 26 (the exact major is in `.nvmrc`) and pnpm >= 9.

```bash
pnpm install
pnpm dev          # start dev server
pnpm build        # production build
pnpm --filter @time-zones/client preview   # serve the production build (with the service worker)
pnpm preflight    # lint + typecheck + tests
```

The app is served under `/time-zones/` in every mode (dev, preview, production), so open `http://localhost:<port>/time-zones/`. The base path is defined once in [`packages/client/app.config.ts`](packages/client/app.config.ts).

### Screenshot tests

Chromium renders text and focus rings slightly differently on macOS, on each Linux distribution and on the CI runner, so the screenshot baselines in [`packages/client/src/test/features/__screenshots__/`](packages/client/src/test/features/__screenshots__/) are taken and checked in one place only: the Playwright Docker image of the installed `@playwright/test`, with the Node and pnpm of this repository ([`packages/client/screenshots/Dockerfile`](packages/client/screenshots/Dockerfile)). It works the same on macOS and Linux and needs only a running Docker:

```bash
pnpm --filter @time-zones/client test:screenshots                      # check the baselines
pnpm --filter @time-zones/client test:screenshots --update-snapshots   # re-approve the changed ones
```

`pnpm --filter @time-zones/client test:bdd` skips the `@screenshot` scenarios; CI runs both. After a UI change, re-approve with the command above and commit the changed images. Never re-approve with a plain `playwright test` on your machine: those images match only your OS and fail in CI.

### Replacing the logo

All icons (favicon, Apple touch icon, 192/512 px and maskable manifest icons) are generated during the build from one image. To change the logo, replace [`packages/client/assets/app-icon-source.jpg`](packages/client/assets/app-icon-source.jpg) with a square image (at least 512×512 px) and run `pnpm build` — no other edits are needed. Padding and background of the maskable icon are set in [`packages/client/pwa-assets.config.ts`](packages/client/pwa-assets.config.ts).

Features are developed with [OpenSpec](openspec/): `/opsx:propose` → `/opsx:apply` → `/opsx:archive`.

## Deployment

- Every pull request runs [CI](.github/workflows/ci.yml): lint, typecheck, unit tests, production build, initial JS budget (150 KB gzipped), a check that the build left sources untouched, the smoke E2E and the [screenshot tests](#screenshot-tests).
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

| Path                             | What it is                                                                                         |
|----------------------------------|----------------------------------------------------------------------------------------------------|
| `gnomish`                        | wrapper script — the only way to run the factory here                                              |
| `gnomish-up`                     | `serve` plus a live dashboard and the INFO log in one terminal, via the wrapper                    |
| `gnomish.env`                    | the wrapper's own settings: project name, log level, Java launcher, `gnomish-up`                   |
| `gnomish.local.env`              | optional personal overrides of `gnomish.env`, git-ignored                                          |
| `project.yaml.example.host`      | template of the factory's project file `~/.gnomish/projects/time-zones/project.yaml`, host binding |
| `project.yaml.example.container` | the same template for the `container` binding                                                      |
| `gnomish.jar`                    | the factory build, git-ignored, you put it there yourself                                          |
| `sandbox/`                       | Dockerfile of the box gnomes run in under the `container` binding                                  |
| `build-sandbox`                  | builds that image with the tool versions this repository pins                                      |

The pipeline ([`pipeline.yaml`](.gnomish/pipeline.yaml)) takes a task from an idea to a pull request in eight stages. Reviewers and the judges that arbitrate between reviewer and fixer run on Opus; the stages that write run on Sonnet.

| # | Stage          | What the gnome does                                                                                                              | Accepted when                                                                                                                            |
|---|----------------|----------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | `specify`      | turns the task into exactly one OpenSpec change under `openspec/changes/` — the same procedure as `/opsx:propose`                | one active change, `openspec validate --changes --strict`, proposal sections and FR/M ids from [`.claude/rules/`](.claude/rules/), judge |
| 2 | `review-specs` | reviews the change for freshness, completeness and consistency and writes findings to `review-specs.md`, changing nothing else   | report sections, well-formed `R<n>` findings all `open`, no other file touched, judge                                                    |
| 3 | `fix-specs`    | fixes or rejects every finding with evidence, revising only files of the change                                                  | no `open` findings, a resolution for each, nothing outside the change, strict validation, judge                                          |
| 4 | `implement`    | implements the change in `packages/client` with TDD (`/opsx:apply`) and ticks every task                                         | all tasks ticked, 300-line cap, the CI steps: lint, typecheck, test, build, bundle size, BDD E2E; judge                                  |
| 5 | `review-code`  | reviews the implementation (tasks, requirements, scoped mutation runs) and writes findings to `review-code.md`, changing no code | same report format as `review-specs`, no other file touched, judge                                                                       |
| 6 | `fix-code`     | fixes the findings worth fixing with TDD, rejects the rest with evidence                                                         | no `open` findings, tasks stay ticked, the CI steps again, judge                                                                         |
| 7 | `archive`      | archives the change under `openspec/changes/archive/YYYY/MM/` and folds its spec deltas into `openspec/specs/`                   | no active change, grouped archive layout, `openspec validate --specs --strict`, judge                                                    |
| 8 | `deliver`      | opens (or updates) a pull request to `main` and mirrors its body into `pr-body.md`                                               | open PR to `main` with a real title, a body that references the issue and matches `pr-body.md`, judge                                    |

Every stage advances automatically (`advancement: auto`); after `autonomy.attemptLimit` (2) failed attempts the task escalates to a human. The checks compare the branch against `origin/main`, so `.gnomish/` itself has to be on `main` before the factory works tasks — see [Running](#running).

### Setting up the factory on your machine

Do this once per machine, from the root of your clone. The factory keeps everything personal — settings, secrets, logs, worktrees — in its home, `~/.gnomish` (or `$GNOMISH_HOME`), outside the clone, so nothing of yours ends up in git.

**1. Install the tools.**

- Java 25+ and the Claude Code CLI (`claude`) on `PATH`, logged in once with `claude`.
- The OpenSpec CLI, installed globally, at the version pinned in `package.json` (`1.13.2`). The gnome works in a worktree outside this clone (`~/.gnomish/projects/time-zones/worktrees/time-zones/<task>`), where `node_modules` does not exist until the stage's first `pnpm install`:

  ```bash
  npm install -g @fission-ai/openspec@1.13.2   # or: brew install openspec
  ```

- `git push` to `origin` working from this clone without a prompt (SSH key or a credential helper). The factory pushes each task branch `gnomish/<task-id>` itself, with your git credentials, and never asks for a password: a push that would prompt fails.
- For the host binding: the project toolchain — Node.js >= 26, pnpm, `gh`, `jq` and Playwright Chromium for the BDD E2E check of `implement` and `fix-code`:

  ```bash
  pnpm install
  pnpm --filter @time-zones/client exec playwright install chromium
  ```

- For the container binding: Docker, running. The image carries the toolchain itself (step 6).

**2. Build the factory jar** in a clone of [gnomish-factory](https://github.com/oinsio/gnomish-factory) and copy it in (it is git-ignored). Repeat after pulling factory updates:

```bash
./gradlew :bootstrap:bootJar   # in the gnomish-factory clone
cp bootstrap/build/libs/bootstrap-0.1.0-SNAPSHOT.jar <time-zones>/.gnomish/factory/gnomish.jar
```

**3. Register the clone and choose where gnomes run.** Every factory command refuses an unregistered directory. Registering creates the project file `~/.gnomish/projects/time-zones/project.yaml`; then append the template for one of the two bindings:

| Template                                                                               | Gnomes run                                                                  | Choose it when                                    |
|----------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|---------------------------------------------------|
| [`project.yaml.example.host`](.gnomish/factory/project.yaml.example.host)              | on this machine, as you: your files, your network, no limits                | you trust the tasks and want the simplest setup   |
| [`project.yaml.example.container`](.gnomish/factory/project.yaml.example.container)    | in an ephemeral Docker box per task, network limited to three hosts         | you want isolation from your machine              |

```bash
.gnomish/factory/gnomish project add time-zones --dir="$PWD"
cat .gnomish/factory/project.yaml.example.host >> ~/.gnomish/projects/time-zones/project.yaml   # or .container
```

The project file is where the factory's settings live — the binding, the sandbox image, the egress allowlist. The wrapper expects the project name `time-zones` (`GNOMISH_PROJECT_NAME` in [`gnomish.env`](.gnomish/factory/gnomish.env)); if you register under another name, set it in `.gnomish/factory/gnomish.local.env`.

**4. Put the tokens in place.** Each secret is a file in `~/.gnomish/projects/time-zones/secrets/`, named exactly like the variable, holding only the bare value (no `KEY=`, no quotes), mode 600 — a file readable by others is refused.

| File                           | Needed                                     | What to put in it                                                                                                            | Who uses it                                                                                     |
|--------------------------------|--------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------|
| `GNOMISH_GITHUB_TOKEN`         | yes, for `take` and `serve`                | GitHub token for the tracker repository (`tracker.github.repo` in [`config.yaml`](.gnomish/config.yaml)): Issues read/write  | the factory: claims issues, moves `gnomish:*` labels, posts comments                            |
| `GH_TOKEN`                     | recommended                                | fine-grained token for the same repository: Contents and Pull requests read/write                                            | `gh` in the `deliver` stage, to open the pull request; exported by the wrapper                  |
| `CLAUDE_CODE_OAUTH_TOKEN`      | container: yes; host: optional             | the token `claude setup-token` prints                                                                                        | the agent and the judges; exported by the wrapper. On the host, without it, your `claude` login is used |

Without `GH_TOKEN` the wrapper hands `gh` the tracker token instead — then it needs Contents and Pull requests too, and the gnome holds its issue rights as well. A plain `run` without the tracker needs no `GNOMISH_GITHUB_TOKEN`.

```bash
secrets=~/.gnomish/projects/time-zones/secrets
mkdir -p -m 700 "$secrets"
for name in GNOMISH_GITHUB_TOKEN GH_TOKEN CLAUDE_CODE_OAUTH_TOKEN; do
    install -m 600 /dev/null "$secrets/$name"
done
claude setup-token                              # prints the token for CLAUDE_CODE_OAUTH_TOKEN
$EDITOR "$secrets/GNOMISH_GITHUB_TOKEN"         # paste each token into its file and save
```

A token you use for every project can go into `~/.gnomish/secrets/<NAME>` once instead: the project folder is searched first, then that one.

**5. Check the setup.**

```bash
.gnomish/factory/gnomish project show time-zones   # the binding and every setting, with the file and line it came from
.gnomish/factory/gnomish board                     # reaches the tracker with your token: three empty or filled columns
```

A misplaced setting or a secret file with loose permissions stops the factory before it touches anything, listing every problem with its fix.

**6. Container binding only: build the image** — see [Running in Docker](#running-in-docker):

```bash
.gnomish/factory/build-sandbox
```

**7. Run.** `serve` and `take` work only what is on `main`, so start from an up-to-date `main`:

```bash
.gnomish/factory/gnomish run --task="Add a meeting planner view"   # one task, no tracker
.gnomish/factory/gnomish-up                                        # daemon over issues labelled gnomish:ready, with a dashboard
```

The commands, logs and labels are in [Running](#running).

### Running

The wrapper adds `--dir` (this project), loads [`gnomish.env`](.gnomish/factory/gnomish.env) and exports `GH_TOKEN` and `CLAUDE_CODE_OAUTH_TOKEN` from the secrets folder. Factory settings come from `~/.gnomish/factory.yaml` (host), then `~/.gnomish/projects/time-zones/project.yaml`, then a flag (`--factory.git-network-timeout=10m`) — each outranks the one before it, except the sandbox-boundary keys, which only `project.yaml` may set. The wrapper's own settings are overridden in `gnomish.local.env` or the shell (`GNOMISH_LOG_LEVEL=DEBUG .gnomish/factory/gnomish ...`).

```bash
# One ad-hoc task, no tracker: branch gnomish/<task-id> in a worktree, the clone is not touched
.gnomish/factory/gnomish run --task="Add a meeting planner view"

# The same, but you play the gnome and the judge — a dry run of a stage you are editing
.gnomish/factory/gnomish run --task="..." --mode=in-place --interactive

# Tasks from GitHub issues: label an issue gnomish:ready, then
.gnomish/factory/gnomish take 42          # work that issue
.gnomish/factory/gnomish serve --drain    # work the whole ready queue, then exit

# The same daemon, but watchable: opens the dashboard in a browser and follows the INFO log
.gnomish/factory/gnomish-up               # serve flags pass through: --drain, --slots=2
.gnomish/factory/gnomish-up --no-open --no-logs

.gnomish/factory/gnomish status <task-id> # where a task is and what happened to it
```

`serve` and `take` read `tracker:` from the default branch and the stages from the task's base (`main`), so commit `.gnomish/` changes and merge them to `main` before they apply there. Start `run` from an up-to-date `main` too: `fix-specs`, `implement` and `fix-code` diff the branch against `origin/main`, and unmerged commits of another branch would count as the task's own changes.

Without `--base`, `run` reads `.gnomish/` from the working tree, so uncommitted edits to a stage take effect immediately. A finished task leaves a `gnomish/<task-id>` branch; squash-merge it so the round-by-round history stays on the branch. Logs: `~/.gnomish/projects/time-zones/logs/default.log`. Labels: `gnomish:ready` → `gnomish:working` → `gnomish:delivered`, or `gnomish:needs-human` when a task escalates.

### Running in Docker

With `factory.bindings.default: host` in `project.yaml` every gnome process runs on this machine as you, with access to your files and no network restrictions. The `container` binding ([`project.yaml.example.container`](.gnomish/factory/project.yaml.example.container)) runs each task in an ephemeral Docker box instead, behind an egress guard that lets through only `api.anthropic.com`, `registry.npmjs.org` and `api.github.com`.

1. **Docker** running on this machine.
2. **The image**, built once and again whenever pnpm, openspec or Playwright change in the repository (bump the `factory.sandbox.image` tag in `project.yaml` then — `build-sandbox` reads it from there). It carries node from `.nvmrc`, pnpm, openspec, the Claude Code CLI, `gh`, `jq` and Playwright Chromium at the versions `package.json` and `pnpm-lock.yaml` pin:

   ```bash
   .gnomish/factory/build-sandbox
   ```

3. **`CLAUDE_CODE_OAUTH_TOKEN`** in the secrets folder ([step 4](#setting-up-the-factory-on-your-machine)) or `ANTHROPIC_API_KEY` in the shell — a box has no keychain, so the host login does not carry over.

### Switching between host and Docker

The mode is `factory.bindings.default` in `~/.gnomish/projects/time-zones/project.yaml`: `host` or `container`. It is a sandbox-boundary key, so that file is the only place it can be set — a `--factory.bindings.default=...` flag stops the factory at startup. To switch, edit the file:

```yaml
factory:
  bindings:
    default: host        # or container
```

The two templates show what each mode needs: `container` also sets the image, the egress allowlist and the resource limits. Every stage of the pipeline runs in the same mode — the factory refuses a per-stage mix of `host` and `container`.

The Java 25 runtime and the jar stay on the host: the factory itself runs there and drives the boxes through Docker. A host a tool needs but the guard denies shows up as an `egress denial:` line in `gnomish status`; add it to `factory.sandbox.egress-allowlist` in `project.yaml` only once you know which tool asked for it.

Full reference: the factory's [operator guides](https://github.com/oinsio/gnomish-factory/tree/main/docs/guides) (`operator-guide.md` for the tracker, `-run.md` for `run`, `-serve.md` for `serve`).

## License

[Apache License 2.0](LICENSE)
