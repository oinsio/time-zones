# Part 1. The share window

Idea taken from the Share Meeting window of World Time Buddy; the look is ours.

## Today

- The Share button of the meeting bar builds the text at once and hands it over, with no window in between (`useMeetingShare`).
- The text has one line per location of the list (`presentMeetingShareText`).
- Every word comes from the interface language: the text is assembled from labels already made for the screen.
- One destination: the `TextSharing` port takes a ready string, opens the system share sheet where the browser has one, otherwise copies to the clipboard.
- A line names no zone: `Moscow: 01:00–04:00`.
- The Russian heading reads `Встреча суббота, 21 ноября 2026 г., 3 ч`: the string `Встреча {{date}}, {{duration}}` mirrors `Meeting on {{date}}`, and the browser gives the weekday in the nominative case only.

## Decisions

| What | Decision |
|---|---|
| Leaving locations out | A checkbox per location. Not the red crosses of the sample: a cross cannot be undone without closing the window |
| Checkboxes on opening | All ticked, every time. Unticked locations are not remembered |
| Language of the text | Chosen in the window; affects the invitation text only, never the interface |
| Zone label in a line | Two toggles in the window: Abbreviation and UTC offset |
| Heading | A full sentence per weekday (below) |
| Preview | The final text is shown in the window and follows every change at once |
| Destination | One Share button: the system share sheet, the clipboard as the fallback. No separate Copy button — the sheet has one |
| Outcome | The existing notices ("Meeting text copied", "Could not share the meeting"). No modal "OK" |

## The window, top to bottom

1. Title `Meeting · 3 h` and the meeting date in the reference zone; the close button.
2. The locations with checkboxes, in list order: city, zone label in small type, meeting span, local date.
3. Language: a button with the flag and the name of the language, and the pin button next to it.
4. Zone label: Abbreviation, UTC offset.
5. Preview of the text.
6. The Share button. Other destinations will stand next to it later.

It is built on the existing `DialogContent`: full screen below 640 px, centred and up to 512 px wide from 640 px.

Sizes come from controls the app already has (measured in the running app at 390 px):

| Element | Taken from | Values |
|---|---|---|
| Window | Add location dialog | padding 16 px, gap between blocks 16 px |
| Window title | same | 18 px, weight 600, line 28 px |
| Close button | same | 44 × 44 px |
| Section caption | settings captions | 14 px, weight 600, muted foreground |
| Zone label toggles | Zone label group of the settings | height 44 px, padding 8 px, radius 6 px, 14 px / 600, gap 4 px, 1 px accent border when on |
| Language button | language button of the settings | height 44 px, padding 8 × 16 px, 16 px / 600, 12 px between flag and name, radius 6 px |

Edge cases:

- No location ticked: the Share button is inactive and the preview shows a hint.
- A long list scrolls inside the window; the Share button stays visible.
- The meeting range changes or is cleared while the window is open (another tab): the window closes.
- Only the languages the app has can be chosen — the same list as in the settings.

## Language and the pin

- By default the text is in the interface language.
- The language button shows the flag before the name, as in the settings.
- The pin button (Lucide `Pin`) is square, 44 × 44 px, with no text and no caption under it: the preview shows the language, the pin shows whether it is kept.
- Not pinned: an outlined pin in the muted colour, control border. Pinned: a filled accent pin, accent border. The button has an accessible name and a pressed state.
- Pin off: next time the window opens in the interface language again.
- Pin on: the language is remembered and used on every opening until the pin is taken off. Changing the language while pinned remembers the new one.
- Stored as a new preference shaped like `interfaceLanguage`: a language code, or `null` for "as the interface".
- Every word of the text follows the chosen language: the heading, city names, dates, the day shift mark, zone abbreviations (`МСК` in Russian, `MSK` in English).
- The hour format (12/24) comes from the settings and is not chosen here.

Why a pin: there is no settled pattern for this case. In Google Translate a pin keeps languages at the top of a long list; "remember the last choice" does not fit, because without the pin the language must return to the interface language.

## Zone label in a line

By default a line has the city, the zone abbreviation where the zone has one, and the UTC offset.

| Toggles | Moscow | Almaty (no abbreviation) |
|---|---|---|
| Both on (default) | `Moscow (MSK, UTC+3): 01:00–04:00` | `Almaty (UTC+5): 03:00–06:00` |
| Abbreviation only | `Moscow (MSK): 01:00–04:00` | `Almaty: 03:00–06:00` |
| UTC offset only | `Moscow (UTC+3): 01:00–04:00` | `Almaty (UTC+5): 03:00–06:00` |
| Both off | `Moscow: 01:00–04:00` | `Almaty: 03:00–06:00` |

- The city is always there.
- The zone stands after the city, not at the end of the line, where the day shift mark may already stand.
- The UTC line has no repeat: `UTC: 22:00–01:00`.
- Abbreviation and offset are those at the start of the meeting (CET in winter, CEST in summer).
- No country. Never "GMT": the app is built around UTC.
- The toggles are the control and the names of the Zone label group of the settings, without Country.
- The choice is remembered by itself, with no pin, and is stored apart from the zone label setting of the views.

Why both: settled teams speak in their zone names (MSK, IST, CET, PST) and read a bare offset badly; style guides prefer the offset because abbreviations are ambiguous (IST is India and Ireland). Together they cover both.

## Heading

A language with cases has one string per weekday (i18next context variants); the plain string stays as the fallback, so a language without cases needs only that one. The date without the weekday still comes from the browser. The weekday is that of the meeting start in the reference zone.

Russian: `Встреча в понедельник, …`, `во вторник`, `в среду`, `в четверг`, `в пятницу`, `в субботу`, `в воскресенье`. English stays `Meeting on Saturday, November 21, 2026, 3 h`.

Rejected: `Встреча: суббота, …` (dry) and a heading without the weekday.

## Example

```
Встреча в субботу, 21 ноября 2026 г., 3 ч
Алматы (UTC+5): 03:00–06:00
Москва (МСК, UTC+3): 01:00–04:00
Белград (CET, UTC+1): 23:00–02:00 (днём раньше, пт, 20 нояб.)
```

```
Meeting on Saturday, November 21, 2026, 3 h
Almaty (UTC+5): 03:00–06:00
Moscow (MSK, UTC+3): 01:00–04:00
Belgrade (CET, UTC+1): 23:00–02:00 (a day earlier, Fri, Nov 20)
```

## Ground for later destinations

Only the share sheet is built now, but the structure is ready for a calendar event, an email and a web page.

1. **Invitation** — data with no language and no layout: the start and end instants, the ticked locations with their zones.
2. **Formatter** — makes the text from the invitation, the language, the zone label choice and the hour format. It reads no labels from the screen.
3. **Destination registry** — after the view registry (ADR-0005). A destination has an icon, a name, an availability check and a send action, and takes the invitation, not a string: a calendar needs instants, not text.

The window lists the destinations of the registry; a new one needs no change to the window. Today's `TextSharing` becomes the first destination.

## Requirements to rewrite

- `meeting-range`: "Share meeting text" (ticked locations only, words from the invitation language, the zone in a line, the heading per weekday); "Share meeting outcome" (fires from the window).
- `grid-view`: the Share button opens the window.
- `settings`: the preferences document gains the invitation language and the zone label choice of the invitation; neither is on the settings page.
- `TextSharing` and `useMeetingShare`: from a string to an invitation and a registry.
- Glossary: invitation, invitation language, zone label of the invitation, destination.

## Open questions

- Names of the new terms in the glossary and the code.
- A new ADR for the destination registry, or a reference to ADR-0005.
- When the zone label choice is stored: on every toggle, or only after sharing.
- The location row of the window at 320 px.
