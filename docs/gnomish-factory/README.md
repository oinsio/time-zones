# Gnomish Factory: setting up and running on your machine

Русская версия: [README.ru.md](README.ru.md). Overview and the stage table: [the project README](../../README.md#gnomish-factory).

`factory/` holds:

| Path                             | What it is                                                                                         |
|----------------------------------|----------------------------------------------------------------------------------------------------|
| `gnomish`                        | wrapper script — the only way to run the factory here                                              |
| `gnomish-up`                     | `serve` plus a live dashboard and the INFO log in one terminal, via the wrapper                    |
| `gnomish.env`                    | the wrapper's own settings: project name, log level, factory version, `gnomish-up`                 |
| `gnomish.local.env`              | optional personal overrides of `gnomish.env`, git-ignored                                          |
| `project.yaml.example.host`      | template of the factory's project file `~/.gnomish/projects/time-zones/project.yaml`, host binding |
| `project.yaml.example.container` | the same template for the `container` binding                                                      |
| `gnomish-<version>/`             | the unpacked factory release, git-ignored, you put it there yourself                               |
| `sandbox/`                       | Dockerfile of the box gnomes run in under the `container` binding                                  |
| `build-sandbox`                  | builds that image with the tool versions this repository pins                                      |


## Setting up the factory on your machine

Do this once per machine, from the root of your clone. The factory keeps everything personal — settings, secrets, logs, worktrees — in its home, `~/.gnomish` (or `$GNOMISH_HOME`), outside the clone, so nothing of yours ends up in git.

**1. Install the tools.**

- Java 25+ and the Claude Code CLI (`claude`) on `PATH`, logged in once with `claude`.
- git 2.56.0 or newer on `PATH`: the factory refuses an older one at startup (macOS: `brew install git`).
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

**2. Unpack the factory release** next to the wrapper (it is git-ignored). The version is `GNOMISH_VERSION` in [`gnomish.env`](../../.gnomish/factory/gnomish.env); to upgrade, change it there and repeat:

```bash
cd .gnomish/factory
VERSION=0.1.0
BASE=https://github.com/oinsio/gnomish-factory/releases/download/v$VERSION
curl -fL -O "$BASE/gnomish-$VERSION.tar.gz" -O "$BASE/SHA256SUMS"
shasum -a 256 -c --ignore-missing SHA256SUMS   # Linux: sha256sum -c --ignore-missing SHA256SUMS
tar -xzf "gnomish-$VERSION.tar.gz"
gnomish-$VERSION/bin/gnomish --version         # prints 0.1.0
cd -
```

**3. Register the clone and choose where gnomes run.** Every factory command refuses an unregistered directory. Registering creates the project file `~/.gnomish/projects/time-zones/project.yaml`; then append the template for one of the two bindings:

| Template                                                                               | Gnomes run                                                                  | Choose it when                                    |
|----------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|---------------------------------------------------|
| [`project.yaml.example.host`](../../.gnomish/factory/project.yaml.example.host)              | on this machine, as you: your files, your network, no limits                | you trust the tasks and want the simplest setup   |
| [`project.yaml.example.container`](../../.gnomish/factory/project.yaml.example.container)    | in an ephemeral Docker box per task, network limited to its egress allowlist       | you want isolation from your machine              |

```bash
.gnomish/factory/gnomish project add time-zones --dir="$PWD"
cat .gnomish/factory/project.yaml.example.host >> ~/.gnomish/projects/time-zones/project.yaml   # or .container
```

The project file is where the factory's settings live — the binding, the sandbox image, the egress allowlist. The wrapper expects the project name `time-zones` (`GNOMISH_PROJECT_NAME` in [`gnomish.env`](../../.gnomish/factory/gnomish.env)); if you register under another name, set it in `.gnomish/factory/gnomish.local.env`.

**4. Put the tokens in place.** Each secret is a file in `~/.gnomish/projects/time-zones/secrets/`, named exactly like the variable, holding only the bare value (no `KEY=`, no quotes), mode 600 — a file readable by others is refused.

| File                      | Needed                         | What to put in it                                                                                                           | Who uses it                                                                                             |
|---------------------------|--------------------------------|-----------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| `GNOMISH_GITHUB_TOKEN`    | yes, for `take` and `serve`    | GitHub token for the tracker repository (`tracker.github.repo` in [`config.yaml`](../../.gnomish/config.yaml)): Issues read/write | the factory: claims issues, moves `gnomish:*` labels, posts comments                                    |
| `GH_TOKEN`                | recommended                    | fine-grained token for the same repository: Contents and Pull requests read/write                                           | `gh` in the `deliver` stage, to open the pull request; exported by the wrapper                          |
| `CLAUDE_CODE_OAUTH_TOKEN` | container: yes; host: optional | the token `claude setup-token` prints                                                                                       | the agent and the judges; exported by the wrapper. On the host, without it, your `claude` login is used |

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

## Running

The wrapper adds `--dir` (this project), loads [`gnomish.env`](../../.gnomish/factory/gnomish.env) and exports `GH_TOKEN` and `CLAUDE_CODE_OAUTH_TOKEN` from the secrets folder. Factory settings come from `~/.gnomish/factory.yaml` (host), then `~/.gnomish/projects/time-zones/project.yaml`, then a flag (`--factory.git-network-timeout=10m`) — each outranks the one before it, except the sandbox-boundary keys, which only `project.yaml` may set. The wrapper's own settings are overridden in `gnomish.local.env` or the shell (`GNOMISH_LOG_LEVEL=DEBUG .gnomish/factory/gnomish ...`).

```bash
# One ad-hoc task, no tracker: branch gnomish/<task-id> in a worktree, the clone is not touched
.gnomish/factory/gnomish run --task="Add a meeting planner view"

# Tasks from GitHub issues: label an issue gnomish:ready, then
.gnomish/factory/gnomish take 42          # work that issue
.gnomish/factory/gnomish serve --drain    # work the whole ready queue, then exit

# The same daemon, but watchable: opens the dashboard in a browser and follows the INFO log
.gnomish/factory/gnomish-up               # serve flags pass through: --drain, --slots=2
.gnomish/factory/gnomish-up --no-open --no-logs

.gnomish/factory/gnomish status <task-id> # where a task is and what happened to it
```

`serve` and `take` read `tracker:` from the default branch and the stages from the task's base (`main`), so commit `.gnomish/` changes and merge them to `main` before they apply there. Start `run` from an up-to-date `main` too: the task branch starts from the current `main`, and the stages that diff it take the parent of its `gnomish: task started` commit as the base, so commits of another unmerged branch would count as the task's own changes.

Without `--base`, `run` reads `.gnomish/` from the working tree, so uncommitted edits to a stage take effect immediately. A finished task leaves a `gnomish/<task-id>` branch; squash-merge it so the round-by-round history stays on the branch. Logs: `~/.gnomish/projects/time-zones/logs/default.log`. Labels: `gnomish:ready` → `gnomish:working` → `gnomish:delivered`, or `gnomish:needs-human` when a task escalates.

## Running in Docker

With `factory.bindings.default: host` in `project.yaml` every gnome process runs on this machine as you, with access to your files and no network restrictions. The `container` binding ([`project.yaml.example.container`](../../.gnomish/factory/project.yaml.example.container)) runs each task in an ephemeral Docker box instead, behind an egress guard that lets through only the hosts of its egress allowlist: `api.anthropic.com`, `registry.npmjs.org`, `api.github.com`, `data.iana.org`, `www.iana.org` and `download.geonames.org`.

1. **Docker** running on this machine.
2. **The image**, built once and again whenever pnpm, openspec or Playwright change in the repository (bump the `factory.sandbox.image` tag in `project.yaml` then — `build-sandbox` reads it from there). It carries node from `.nvmrc`, pnpm, openspec, the Claude Code CLI, `gh`, `jq` and Playwright Chromium at the versions `package.json` and `pnpm-lock.yaml` pin:

   ```bash
   .gnomish/factory/build-sandbox
   ```

3. **`CLAUDE_CODE_OAUTH_TOKEN`** in the secrets folder ([step 4](#setting-up-the-factory-on-your-machine)) or `ANTHROPIC_API_KEY` in the shell — a box has no keychain, so the host login does not carry over.

## Switching between host and Docker

The mode is `factory.bindings.default` in `~/.gnomish/projects/time-zones/project.yaml`: `host` or `container`. It is a sandbox-boundary key, so that file is the only place it can be set — a `--factory.bindings.default=...` flag stops the factory at startup. To switch, edit the file:

```yaml
factory:
  bindings:
    default: host        # or container
```

The two templates show what each mode needs: `container` also sets the image, the egress allowlist and the resource limits. Every stage of the pipeline runs in the same mode — the factory refuses a per-stage mix of `host` and `container`.

The Java 25 runtime and the factory release stay on the host: the factory itself runs there and drives the boxes through Docker. A host a tool needs but the guard denies shows up as an `egress denial:` line in `gnomish status`; add it to `factory.sandbox.egress-allowlist` in `project.yaml` only once you know which tool asked for it.

Full reference: the factory's [operator guides](https://github.com/oinsio/gnomish-factory/tree/main/docs/guides) (`operator-guide.md` for the tracker, `-run.md` for `run`, `-serve.md` for `serve`).
