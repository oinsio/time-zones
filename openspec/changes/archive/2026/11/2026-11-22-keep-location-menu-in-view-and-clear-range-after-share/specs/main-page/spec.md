## ADDED Requirements

### Requirement: README screenshots of the running app
The repository's `README.md` SHALL show five screenshots of the running app with the English interface, and `README.ru.md` the same five with the Russian interface. Each one MUST be an approved screenshot of a browser test of the main page, so that a change of the app that alters it fails that test until the screenshot is approved again. No image of either README MAY point to a design screen under `docs/design/screens/`. The five states use the sample (the current time `2026-03-08T07:30:00Z`, the device time zone `Asia/Almaty`, the list Almaty (home), Moscow, Kolkata, New York):

| state | view | screen | theme |
|---|---|---|---|
| cards on a phone | Cards | 390 × 844 px | light |
| cards on a phone, dark | Cards | 390 × 844 px | dark |
| cards on a tablet | Cards | 820 × 1180 px | light |
| grid on a desktop | Grid | 1440 × 900 px | light |
| grid on a desktop with a meeting | Grid with the sample meeting 09:00–11:00 in Almaty | 1440 × 900 px | dark |

Each image MUST carry alternative text in its README's language that names the view, the device and the theme, and, for the last one, the meeting range. Inputs: the built app. Output: ten approved PNG files. Errors: none. <!-- implements FR8 of keep-location-menu-in-view-and-clear-range-after-share -->

#### Scenario: The screenshots are approved screenshots of the app
- **GIVEN** the sample in the `<language>` interface
- **WHEN** the main page is shown in the state `<state>`
- **THEN** the screen matches its approved README screenshot

| language | state |
|---|---|
| English | cards on a phone |
| English | cards on a phone, dark |
| English | cards on a tablet |
| English | grid on a desktop |
| English | grid on a desktop with a meeting |
| Russian | cards on a phone |
| Russian | cards on a phone, dark |
| Russian | cards on a tablet |
| Russian | grid on a desktop |
| Russian | grid on a desktop with a meeting |

#### Scenario: The READMEs show the approved screenshots
- **WHEN** a reader opens `README.md` and `README.ru.md`
- **THEN** `README.md` shows the five English screenshots and `README.ru.md` the five Russian ones
- **AND** no image of either README comes from `docs/design/screens/`
