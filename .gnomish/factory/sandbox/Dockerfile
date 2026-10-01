# Sandbox image for the time-zones pipeline: the box every gnome round, judge vote and command
# check runs in when the factory binds `container` (factory.bindings.default in
# ~/.gnomish/projects/time-zones/project.yaml).
# Build it with .gnomish/factory/build-sandbox, not by hand: the script reads the tag from
# project.yaml (factory.sandbox.image), the Node version from .nvmrc and every tool version below from package.json and
# pnpm-lock.yaml, so the image cannot drift from what the repository pins.
#
# Derived from the factory's reference recipe (gnomish-factory: docs/examples/sandbox-image/),
# minus the JVM toolchain and plus what the four stages call:
#   specify, archive  — openspec
#   implement         — pnpm, jq (the .claude/settings.json hooks), Playwright Chromium (test:bdd)
#   deliver           — gh
#
# The factory's image contract: git and curl on PATH; a non-root user `gnome` with uid 1000
# owning /gnomish/**; control surfaces (agent policy, CA, proxy settings) root-owned. The box
# has no route to any registry except through the egress guard, so every tool is baked here.
ARG NODE_VERSION=26
FROM node:${NODE_VERSION}-bookworm-slim

ARG PNPM_VERSION
ARG OPENSPEC_VERSION
ARG PLAYWRIGHT_VERSION
ARG AGENT_CLI_PACKAGE=@anthropic-ai/claude-code
ARG NPM_REGISTRY=https://registry.npmjs.org/
# The egress guard's stable alias on the task network; matches the factory's own.
ARG PROXY_HOST=gnomish-guard
ARG PROXY_PORT=8080

RUN test -n "$PNPM_VERSION" && test -n "$OPENSPEC_VERSION" && test -n "$PLAYWRIGHT_VERSION" \
 || { echo "PNPM_VERSION, OPENSPEC_VERSION and PLAYWRIGHT_VERSION are required - build with .gnomish/factory/build-sandbox" >&2; exit 1; }

# git + curl are the contract; jq runs in the Claude Code hooks; gh from GitHub's own apt
# repository, Debian's is too old for `gh pr list --json`. procps gives `ps`, which tree-kill
# (Stryker, vitest) needs to stop its child processes; without it every run leaves orphans.
# tini is PID 1 (see ENTRYPOINT below).
RUN apt-get update \
 && apt-get install -y --no-install-recommends git curl ca-certificates jq gnupg procps tini \
 && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
      -o /usr/share/keyrings/githubcli-archive-keyring.gpg \
 && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
      > /etc/apt/sources.list.d/github-cli.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends gh \
 && rm -rf /var/lib/apt/lists/*

# Global CLIs at the versions the repository pins. The worktree's node_modules does not exist
# until the implement stage installs it, so openspec must be global.
RUN npm install -g --registry "$NPM_REGISTRY" \
      "pnpm@${PNPM_VERSION}" \
      "@fission-ai/openspec@${OPENSPEC_VERSION}" \
      "$AGENT_CLI_PACKAGE" \
 && npm cache clean --force

# Chromium for playwright-bdd, at the exact version the lockfile resolves: a browser build
# belongs to one Playwright release. Outside any home and root-owned — read-only in the box.
ENV PLAYWRIGHT_BROWSERS_PATH=/opt/ms-playwright
RUN npx -y "playwright@${PLAYWRIGHT_VERSION}" install --with-deps chromium \
 && rm -rf /var/lib/apt/lists/* /root/.npm \
 && chmod -R a+rX /opt/ms-playwright

# CA seam: *.pem / *.crt dropped into ca/ are trusted system-wide and by Node. Empty today —
# the guard forwards TLS unmodified until the factory starts intercepting it.
COPY ca/ /tmp/gnomish-ca/
RUN set -e; \
    for cert in /tmp/gnomish-ca/*.pem /tmp/gnomish-ca/*.crt; do \
      [ -f "$cert" ] || continue; \
      name="$(basename "$cert")"; \
      cp "$cert" "/usr/local/share/ca-certificates/${name%.*}.crt"; \
    done; \
    update-ca-certificates; \
    rm -rf /tmp/gnomish-ca

# The task user. node images ship `node` as uid 1000 — renamed rather than duplicated.
RUN if getent passwd 1000 >/dev/null; then \
      old_user="$(getent passwd 1000 | cut -d: -f1)"; \
      usermod -l gnome -d /home/gnome -m "$old_user"; \
      groupmod -n gnome "$(getent group "$(id -g gnome)" | cut -d: -f1)"; \
    else \
      useradd -m -u 1000 gnome; \
    fi \
 && mkdir -p /gnomish/work /gnomish/scratch \
 && chown -R gnome:gnome /gnomish

# Agent policy surface: managed settings outrank anything the gnome writes under its home.
RUN mkdir -p /etc/claude-code \
 && printf '{}\n' > /etc/claude-code/managed-settings.json \
 && chown -R root:root /etc/claude-code \
 && chmod 0755 /etc/claude-code && chmod 0644 /etc/claude-code/managed-settings.json

# The guard is the only route out, so every tool gets the proxy — except loopback, where
# vite preview and Playwright talk to each other during test:bdd. The agent CLI's telemetry
# and auto-update would only show up as egress denials, so they are off.
ENV HTTP_PROXY=http://${PROXY_HOST}:${PROXY_PORT} \
    HTTPS_PROXY=http://${PROXY_HOST}:${PROXY_PORT} \
    http_proxy=http://${PROXY_HOST}:${PROXY_PORT} \
    https_proxy=http://${PROXY_HOST}:${PROXY_PORT} \
    NO_PROXY=localhost,127.0.0.1,::1 \
    no_proxy=localhost,127.0.0.1,::1 \
    NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt \
    CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1 \
    DISABLE_AUTOUPDATER=1 \
    CI=1

# The factory starts the box with a bare keep-alive command and no --init, so without this the
# keep-alive `sleep` is PID 1 and never reaps: every orphaned process stays a zombie holding a
# PID until the box dies, and a task-long box runs into --pids-limit. tini reaps them.
ENTRYPOINT ["/usr/bin/tini", "--", "docker-entrypoint.sh"]

USER gnome
WORKDIR /gnomish/work
