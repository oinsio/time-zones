## H1: README screenshots point at the approved baselines

- **Serves:** FR8, M4 of keep-location-menu-in-view-and-clear-range-after-share (D4).
- **Files:** `README.md`, `README.ru.md`.
- **Verify:** `git apply --check H1-readme-screenshots.patch`; `grep -c "README-screenshot-.*-en.png" README.md` prints 5; `grep -c "README-screenshot-.*-ru.png" README.ru.md` prints 5; `grep -c "docs/design/screens" README.md README.ru.md` prints 0 for both.
- **Why manual:** the implement stage may write only under `packages/`, under `docs/` other than `docs/adr/`, and in the task's handoff folder; the root `README.md` and `README.ru.md` are outside those limits.
- **Automated part:** task 6.1 produces the ten screenshots as approved baselines and checks them on every browser test run; task 6.2 checks the patch with `git apply --check` and greps it for five English and five Russian images and no design screen.
