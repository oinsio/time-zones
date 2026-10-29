Change: show-here-entry-for-device-time
Verdict: no-blocking-dependencies

## Notes

- Both dependencies are archived. The earlier escalation was an infrastructure fault, not a blocker.
- The background load of the exemplar city conflicts with the stable location-search rule "no request before the search opens". The change now MODIFIES that requirement (proposal Q5).
- Glossary, docs/architecture/views.md and domain-model.md edits are handoff patches H1 and H2. They apply after the still-pending handoff patches of set-home-location-and-show-differences with `git apply -C0` (tasks.md, section 9).
