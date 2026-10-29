# Sourced by the stage checks (`. .gnomish/lib/task-change.sh`), never run on its own.
# Resolves where this task's reports live and which OpenSpec change it works on:
#   $reports      temporary-docs/gnomish/<task>/ - every report of the pipeline, removed by cleanup
#   $record       $reports/change.md - the change record the specify stage writes
#   $change_name  the record's 'Change:' line
#   $change       openspec/changes/$change_name (gone once the archive stage has run)
# <task> is the task branch's name without its gnomish/ prefix (the factory's own sanitized
# taskId), or 'local' off a task branch.
branch=$(git branch --show-current)
case "$branch" in gnomish/*) task=${branch#gnomish/} ;; *) task=local ;; esac
reports=temporary-docs/gnomish/$task
record=$reports/change.md
if [ ! -f "$record" ]; then
  echo "no change record at $record - the specify stage writes it, see .gnomish/stages/specify/instructions.md"
  exit 1
fi
change_name=$(sed -n 's/^Change:[[:space:]]*//p' "$record" | head -1 | tr -d '[:space:]')
if [ -z "$change_name" ] || [ "$change_name" = "archive" ]; then
  echo "$record has no 'Change: <name>' line naming a change directory under openspec/changes/"
  exit 1
fi
change=openspec/changes/$change_name
