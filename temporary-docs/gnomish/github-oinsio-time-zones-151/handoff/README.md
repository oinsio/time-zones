## H1: Look at the compact button in the re-approved screenshots

- **Serves:** UX1, FR4, FR5
- **Files:** none
- **Verify:** open the five README images in `docs/design/screens/` (`cards-phone-light.png`, `cards-phone-dark.png`, `cards-tablet-light.png`, `grid-desktop-light.png`, `grid-desktop-meeting-dark.png`) and two re-taken baselines under `packages/client/src/test/features/__screenshots__/chromium/`: one Cards at 375 px (`Screenshot-of-the-home-state-at-375-px-in-the-light-theme.png`) and one Grid at 1440 px. Confirm that the vertical dots sit evenly between the time and the row border, and that nothing looks crowded. Report any mismatch as a new task.
- **Why manual:** whether the spacing looks harmonious is a judgement only a human can make. The numbers behind it are checked automatically.
- **Automated part:** the `@UX1` scenario checks that the two distances differ by at most 10 px. The geometry, overlap and containment scenarios of `locations_menu_button_e2e.feature` and every screenshot scenario run in `pnpm test:bdd`.
