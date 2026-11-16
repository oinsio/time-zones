Change: refresh-data-through-scheduled-pull-requests
Verdict: no-blocking-dependencies

## Notes

- `add-city-coordinates-to-locations` and `add-remote-zone-rules-updates` are archived (landed); `apply-data-updates-silently` only reads this change's trailer and gates switching the workflows on (a human handoff step), not the implement tasks.
