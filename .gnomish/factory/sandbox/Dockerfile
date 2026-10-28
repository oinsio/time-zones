# Sandbox image for the time-zones pipeline: the box every gnome round, judge vote and command
# check runs in when the factory binds `container` (factory.bindings.default in
# ~/.gnomish/projects/time-zones/project.yaml).
# Build it with .gnomish/factory/build-sandbox, not by hand: the script reads the tag from
# project.yaml (factory.sandbox.image), the Node version from .nvmrc and every tool version below from package.json and
# pnpm-lock.yaml, so the image cannot drift from what the repository pins.
#
# Built FROM the factory's sandbox base image (gnomish-factory: sandbox-image/, recipe in
# docs/examples/sandbox-image/), which carries the whole image contract: git and curl, the user
# `gnome` (uid 1000) owning /gnomish/**, the root-owned control surfaces (/etc/gnomish, the agent
# policy with "allowManagedHooksOnly": true), a root-owned home where only declared directories are
# the gnome's, the egress guard's proxy, and the helpers gnomish-home-dir, gnomish-trust-ca and
# gnomish-verify-image. This file adds what the five stages call:
#   specify, archive  — openspec
#   implement         — pnpm, jq, Playwright Chromium (test:bdd)
#   deliver           — gh
#   usage-report      — jq, gh
#
# Consequence of the base's agent policy: hooks run from the managed settings only, so the
# PostToolUse hooks of the repository's .claude/settings.json do not run in the box; the stages'
# own verify checks remain the gate.
#
# The base's proxy names the egress guard, which exists only on a box's task network, so a
# download in a stage FROM the base fails at build time. Node, the global CLIs and the browser are
# fetched in a stage of their own and copied in; the one apt step in the final stage runs with the
# proxy variables unset.
#
# GNOMISH_BASE_IMAGE: the published base of the factory release in use (GNOMISH_VERSION in
# gnomish.env); its MAJOR.MINOR tag follows the release's patch updates of the base.
ARG GNOMISH_BASE_IMAGE=ghcr.io/oinsio/gnomish-sandbox-base:0.1
ARG NODE_VERSION=26

FROM node:${NODE_VERSION}-bookworm-slim AS node-dist

# Node, the global CLIs and Chromium, on the base's own distribution (a Chromium build is chosen
# for the distribution it is installed on).
FROM ubuntu:24.04 AS tools
ARG PNPM_VERSION
ARG OPENSPEC_VERSION
ARG PLAYWRIGHT_VERSION
ARG AGENT_CLI_PACKAGE=@anthropic-ai/claude-code
ARG NPM_REGISTRY=https://registry.npmjs.org/
RUN test -n "$PNPM_VERSION" && test -n "$OPENSPEC_VERSION" && test -n "$PLAYWRIGHT_VERSION" \
 || { echo "PNPM_VERSION, OPENSPEC_VERSION and PLAYWRIGHT_VERSION are required - build with .gnomish/factory/build-sandbox" >&2; exit 1; }
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates libatomic1 \
 && rm -rf /var/lib/apt/lists/*
# The whole /usr/local of the official image: node, npm, npx and corepack, whose relative
# symbolic links stay valid under /opt/node.
COPY --from=node-dist /usr/local /opt/node
ENV PATH=/opt/node/bin:${PATH} \
    PLAYWRIGHT_BROWSERS_PATH=/opt/ms-playwright
# Global CLIs at the versions the repository pins. The worktree's node_modules does not exist
# until the implement stage installs it, so openspec must be global; playwright is global for its
# install-deps step below.
RUN npm install -g --prefix /opt/node --registry "$NPM_REGISTRY" \
      "pnpm@${PNPM_VERSION}" \
      "@fission-ai/openspec@${OPENSPEC_VERSION}" \
      "playwright@${PLAYWRIGHT_VERSION}" \
      "$AGENT_CLI_PACKAGE" \
 && npm cache clean --force \
 && playwright install chromium \
 && chmod -R a+rX /opt/ms-playwright

FROM ${GNOMISH_BASE_IMAGE}
USER root
COPY --from=tools /opt/node /opt/node
COPY --from=tools /opt/ms-playwright /opt/ms-playwright
ENV PATH=/opt/node/bin:${PATH} \
    PLAYWRIGHT_BROWSERS_PATH=/opt/ms-playwright

# libatomic1, which the Node binary links against; jq for the repository's scripts; gh from
# GitHub's own apt repository (the distribution's is too old for `gh pr list --json`); procps gives
# `ps`, which tree-kill (Stryker, vitest) needs to stop its child processes; tini is PID 1 (see
# ENTRYPOINT below); Chromium's shared libraries through Playwright's own list. The proxy variables
# are unset for this one step only.
RUN env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy sh -ec ' \
      apt-get update; \
      apt-get install -y --no-install-recommends libatomic1 jq gnupg procps tini; \
      curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
        -o /usr/share/keyrings/githubcli-archive-keyring.gpg; \
      echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
        > /etc/apt/sources.list.d/github-cli.list; \
      apt-get update; \
      apt-get install -y --no-install-recommends gh; \
      playwright install-deps chromium; \
      rm -rf /var/lib/apt/lists/*'

# Loopback bypasses the guard: vite preview and Playwright talk to each other during test:bdd.
# The agent CLI's telemetry and auto-update would only show up as egress denials, so they are off.
ENV NO_PROXY=localhost,127.0.0.1,::1 \
    no_proxy=localhost,127.0.0.1,::1 \
    NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt \
    CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1 \
    DISABLE_AUTOUPDATER=1 \
    CI=1

# CA seam: *.pem / *.crt dropped into ca/ are imported into the system store (which Node reads
# through NODE_EXTRA_CA_CERTS) by gnomish-trust-ca. Empty today — the guard forwards TLS
# unmodified until the factory starts intercepting it.
COPY --chmod=0644 ca/ /etc/gnomish/ca/
# The gnome's home is root-owned: the toolchains' own directories are declared gnome-writable
# (.npm for npx, .local for pnpm's store and state), then the trust store and the check of the whole
# contract, as root, after every other step.
RUN gnomish-home-dir .npm .local && gnomish-trust-ca && gnomish-verify-image

# The factory starts the box with a bare keep-alive command and no --init, so without this the
# keep-alive `sleep` is PID 1 and never reaps: every orphaned process stays a zombie holding a
# PID until the box dies, and a task-long box runs into --pids-limit. tini reaps them.
ENTRYPOINT ["/usr/bin/tini", "--"]

USER gnome
WORKDIR /gnomish/work
