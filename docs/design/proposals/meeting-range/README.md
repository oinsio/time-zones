# Proposal: sharing, moving and extending the meeting range

Three proposed changes to the meeting range of the Grid view, discussed on 20–21 November 2026 against commit `3485c6e`. Nothing here is built or approved yet: each part becomes an OpenSpec change of its own. The screens in this folder are **not** approved screens; the approved ones stay in [`docs/design/screens`](../../screens).

| Part | Document | In one line |
|---|---|---|
| 1 | [share-window.md](share-window.md) | A window between the Share button and the share sheet: pick the locations, the language and the zone label of the invitation, see the text, then share |
| 2 | [meeting-past-midnight.md](meeting-past-midnight.md) | A meeting range may end after the reference day: the hour strips grow a tail of next-day cells |
| 3 | [move-meeting.md](move-meeting.md) | Move the whole meeting range without changing its length: drag the frame, or a third handle on its top line; the meeting bar sticks to the top |

Order: part 3 builds on part 2 (a moved range may cross midnight). Part 1 is independent.

## Screens

### Share window (part 1)

The window does not exist in the app, so these four screens are drawn by hand: colours from `tokens.css`, sizes of existing controls measured in the running app (the table in [share-window.md](share-window.md)). The location list, the pin button, the preview and the Share button are new, and their sizes are provisional.

| Screen | File | Shows |
|---|---|---|
| Phone, light | [PNG](screens/share-window-phone-light.png) | all locations ticked, interface language, pin off, both zone label parts on |
| Phone, dark | [PNG](screens/share-window-phone-english-pinned-dark.png) | three of six locations, English pinned while the interface is Russian |
| Phone, nothing ticked | [PNG](screens/share-window-phone-none-selected-light.png) | inactive Share button and the hint in the preview |
| Wide, light | [PNG](screens/share-window-wide-abbreviation-only-light.png) | the centred dialog, abbreviation only |

Sample: reference zone Almaty, meeting 03:00–06:00 on Saturday, 21 November 2026; Almaty, Moscow, Minsk, UTC, Belgrade, Novi Sad.

### Grid (parts 2 and 3)

These six screens are screenshots of the running app (commit `3485c6e`, ten locations, Friday, 20 November 2026, device in Belgrade) with only the new elements drawn on top: the move handle, the sticky meeting bar, the lift shadow and the ghost of the previous position, the tail cells. Everything else in them is the app's own layout.

| Screen | File | Shows |
|---|---|---|
| Move handle, list at the top | [PNG](screens/grid-move-handle-list-top-light.png) | the handle on the top line of the meeting frame |
| List in the middle | [PNG](screens/grid-move-handle-list-middle-light.png) | sticky meeting bar; the handle on the bar's bottom line |
| List at the bottom | [PNG](screens/grid-move-handle-list-bottom-light.png) | the same at the end of the list |
| Moving | [PNG](screens/grid-move-dragging-light.png) | the frame moved from 13:00–15:00 to 14:30–16:30, lifted; the previous position dashed |
| Past midnight, phone | [PNG](screens/grid-past-midnight-phone-light.png) | 23:00–02:00 in the reference zone; tail cells of 21 November |
| Past midnight, desktop, dark | [PNG](screens/grid-past-midnight-desktop-dark.png) | 27 cells fit at 1280 px without scrolling |

Known differences from the proposal: on the middle and bottom screens the start and end handles stand by today's rule and do not know about the sticky bar.

## Source

The decisions were taken in Russian and are kept in the Claude project "Time Zones" (`share-meeting-decisions.md`, `meeting-past-midnight-and-move-decisions.md`). These documents are their English record.
