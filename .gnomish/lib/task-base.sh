# Sourced by the stage checks (`. .gnomish/lib/task-base.sh`), never run on its own.
# Sets $base: the commit of main this task branch started from - the parent of the factory's
# `gnomish: task started` commit, which is the task's pinned base commit.
# The factory's box clones only the task branch and removes its `origin` remote, so
# `origin/main` does not exist there; measuring from it silently checks nothing. Off a task
# branch (a local run) there is no `task started` commit, and the merge base with origin/main
# is used instead.
start=$(git log --format='%H %s' | awk '$2 == "gnomish:" && $3 == "task" && $4 == "started" { print $1; exit }')
if [ -n "$start" ]; then
  base=$(git rev-parse "$start^")
else
  base=$(git merge-base HEAD origin/main 2>/dev/null) || {
    echo "cannot tell where this branch started: no 'gnomish: task started' commit and no origin/main"
    exit 1
  }
fi
