#!/usr/bin/env bash
# Runs the @screenshot E2E scenarios inside the pinned Playwright image, so the
# baselines are rendered the same on macOS, on any Linux and in CI. Needs only
# a running Docker. Extra arguments go to `playwright test`:
#
#   pnpm --filter @time-zones/client test:screenshots
#   pnpm --filter @time-zones/client test:screenshots --update-snapshots
#
# Dependencies are installed inside the container into Docker volumes, never
# into this clone's node_modules, which belong to the host's OS.
set -euo pipefail

client_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
repo_dir="$(cd "$client_dir/../.." && pwd)"

playwright_version="$(cd "$client_dir" && node -p "require('@playwright/test/package.json').version")"
node_major="$(tr -d '[:space:]v' < "$repo_dir/.nvmrc")"
pnpm_version="$(cd "$repo_dir" && node -p "require('./package.json').packageManager.split('@')[1]")"
image="time-zones-screenshots:playwright-${playwright_version}-node-${node_major}-pnpm-${pnpm_version}"

volume_prefix="time-zones-screenshots"
root_modules_volume="${volume_prefix}-root-modules"
client_modules_volume="${volume_prefix}-client-modules"
store_volume="${volume_prefix}-pnpm-store"
container_repo_dir=/repo
container_store_dir=/pnpm-store

docker build --quiet \
    --build-arg "PLAYWRIGHT_VERSION=${playwright_version}" \
    --build-arg "NODE_MAJOR=${node_major}" \
    --build-arg "PNPM_VERSION=${pnpm_version}" \
    --tag "$image" \
    "$client_dir/screenshots" >/dev/null

volume_mounts=(
    --volume "${root_modules_volume}:${container_repo_dir}/node_modules"
    --volume "${client_modules_volume}:${container_repo_dir}/packages/client/node_modules"
    --volume "${store_volume}:${container_store_dir}"
)

# Files written into the clone (baselines, reports) belong to the caller, not
# root; the fresh volumes are handed to the same user once.
user_id="$(id -u)"
group_id="$(id -g)"
docker run --rm --user 0 "${volume_mounts[@]}" "$image" \
    chown "${user_id}:${group_id}" \
    "${container_repo_dir}/node_modules" \
    "${container_repo_dir}/packages/client/node_modules" \
    "$container_store_dir"

# shellcheck disable=SC2016 # expanded inside the container
docker run --rm --ipc=host \
    --user "${user_id}:${group_id}" \
    --env HOME=/tmp \
    --env CI=1 \
    --env E2E_SCREENSHOTS=1 \
    --env "npm_config_store_dir=${container_store_dir}" \
    --volume "${repo_dir}:${container_repo_dir}" \
    "${volume_mounts[@]}" \
    --workdir "$container_repo_dir" \
    "$image" \
    bash -euc '
        pnpm install --frozen-lockfile --prefer-offline --reporter=silent
        cd packages/client
        pnpm exec bddgen -c playwright.bdd.config.ts
        pnpm exec playwright test -c playwright.bdd.config.ts --grep @screenshot "$@"
    ' bash "$@"
