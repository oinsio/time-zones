# The one renderer every screenshot baseline is taken and checked with: the
# Playwright image of the installed @playwright/test, plus the project's Node
# and pnpm. Built and run by scripts/test-screenshots.sh, never by hand.
ARG PLAYWRIGHT_VERSION
FROM mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble

ARG NODE_MAJOR
ARG PNPM_VERSION

# Node of the major in .nvmrc, newest release, for the image's architecture.
RUN set -eu; \
    case "$(dpkg --print-architecture)" in \
      amd64) node_arch=x64 ;; \
      arm64) node_arch=arm64 ;; \
      *) echo "unsupported architecture" >&2; exit 1 ;; \
    esac; \
    node_version="$(curl -fsSL https://nodejs.org/dist/index.json \
      | grep -o "\"version\":\"v${NODE_MAJOR}\.[0-9.]*\"" | head -1 | cut -d'"' -f4)"; \
    curl -fsSL "https://nodejs.org/dist/${node_version}/node-${node_version}-linux-${node_arch}.tar.gz" \
      | tar -xz -C /usr/local --strip-components=1

# pnpm of `packageManager`, prepared at build time so a run needs no download
# and works for any user id.
ENV COREPACK_HOME=/opt/corepack \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable \
    && corepack prepare "pnpm@${PNPM_VERSION}" --activate \
    && chmod -R a+rX /opt/corepack
