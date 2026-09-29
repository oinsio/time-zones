#!/bin/bash
# test-on-client-change.sh — PostToolUse hook for Claude Code
# Runs the client test suite, but only when the edited file belongs to
# packages/client. Everything else — docs, openspec artifacts, root configs —
# leaves the suite alone, because no test of it could have changed.

set -euo pipefail

# Read JSON input from Claude Code via stdin
INPUT=$(cat)

# Extract file path (different tool_input structures for Write/Edit/MultiEdit)
FILE_PATH=$(echo "$INPUT" | jq -r '
  .tool_input.file_path //
  .tool_input.path //
  .tool_input.file_paths[0] //
  empty
')

# If path is not defined — nothing to judge, exit silently
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Only files inside the client package can affect its tests
case "$FILE_PATH" in
  */packages/client/*|packages/client/*)
    ;;
  *)
    exit 0
    ;;
esac

REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

# A git worktree has no node_modules, so vitest is not installed there and the
# run would fail on the environment rather than on the code. Say nothing: a
# failure the author cannot act on reads as feedback on their work.
if [ ! -d "$REPO_ROOT/node_modules" ] || [ ! -d "$REPO_ROOT/packages/client/node_modules" ]; then
  exit 0
fi

cd "$REPO_ROOT"
pnpm --filter @time-zones/client test 2>&1 | tail -20

# Always exit 0 — the output is feedback, not a blocker
exit 0
