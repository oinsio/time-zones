Change: add-zone-rules-from-iana
Verdict: no-blocking-dependencies

## Notes

- Applied the task's decisions: release `2026f`; signing key already committed (task 3.1 pins fingerprint `7E3792A9D8ACF7D633BC1588ED97E90E62AA7E34`, expiry 2031-07-24); `gpg` with a temporary `GNUPGHOME`; `VALIDSIG` fingerprint check.
- Applied the #117 spec fixes: Australian and Julian-day scenario rows, Ciudad Juárez UTC−6 (MDT), no `Date.now()` in the wrapper, wider shim cleanup, one owner for `LETTERS_ONLY_DESIGNATION`, abbreviation-table scenario, M7 scope.
- CI step, `.claude/rules/temporal.md` line and ADR-0006 status note are human follow-ups H1–H3 (patches).
