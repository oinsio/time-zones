## MODIFIED Requirements

### Requirement: Location menu
Each card and grid row SHALL have a location menu button showing three vertical dots («⋮»), with no other text and a hit area of at least 44 × 44 px, on the first line of its row header, after the time. The dots are decorative and hidden from assistive technology; the button's accessible name stays "Actions for <city>" / «Действия: <city>». In the Cards and the Grid view the space from the right edge of the time (in Grid while a meeting range is set: the meeting time) to the right content edge of the row MUST be at most 32 px. The button's hit area MUST NOT overlap the time, the local date, the city, the offset difference or the zone line of its row, and it MUST lie inside the border box of its card or inside the Grid panel. The open menu MUST lie inside the screen. The menu has the surface background, the control border and the lift shadow, and its items are the home action, "Move up", "Move down" and "Remove", in this order. It MUST follow the WAI-ARIA menu button pattern: Enter, Space or Arrow Down open it on the first enabled item, the arrows move between enabled items, Enter activates, Esc closes it and returns focus to the button. Opening it MUST NOT start a reorder or move a day track's handle. In the Grid view, while a meeting range is set, the location menu button MUST be locked as "Row controls are locked while a meeting range is set" of `grid-view` says: it MUST NOT be a Tab stop, no pointer, finger or key MUST open the menu, and a menu open when the range is set MUST close; once the meeting range is removed the button MUST work again. The Cards view never locks it. <!-- implements FR11, NFR-A2, UX3 of set-home-location-and-show-differences; FR1, FR2 of fix-grid-meeting-range-lock-and-layering; FR1, FR7, FR16, NFR-A3 of redesign-cards-grid-and-day-palettes; FR1, FR2, FR3, NFR-A1, NFR-R1 of make-location-menu-button-vertical -->

#### Scenario: Vertical dots on the button
- **GIVEN** the list is Almaty and Moscow
- **WHEN** the list is shown in the Cards view and then in the Grid view
- **THEN** each row's location menu button shows three dots one above the other and no text
- **AND** its accessible name is "Actions for Almaty" and "Actions for Moscow"

#### Scenario: Compact button in Cards
- **GIVEN** the stored locations are Almaty, Moscow, Kolkata and New York
- **WHEN** the Cards view is shown `<width>` px wide
- **THEN** in every card the time's right edge is at most 32 px from the card's right content edge
- **AND** every location menu button is at least 44 × 44 px and inside its card
- **AND** no location menu button overlaps the time, the local date, the city, the offset difference or the zone line of its card

| width |
|---|
| 320 |
| 390 |
| 411 |
| 768 |
| 1024 |
| 1440 |

#### Scenario: Compact button in Grid
- **GIVEN** the stored locations are Almaty, Moscow, Kolkata and New York
- **WHEN** the Grid view is shown `<width>` px wide
- **THEN** in every row the time's right edge is at most 32 px from the row's right content edge
- **AND** every location menu button is at least 44 × 44 px and inside the Grid panel
- **AND** no location menu button overlaps the time, the local date, the city, the offset difference or the zone line of its row

| width |
|---|
| 390 |
| 844 |
| 1180 |
| 1440 |

#### Scenario: Compact button next to a meeting time
- **GIVEN** the Grid view 390 px wide with Almaty and Moscow and the meeting range 09:00–11:00 in Almaty
- **THEN** in every row the meeting time's right edge is at most 32 px from the row's right content edge
- **AND** no location menu button overlaps the meeting time of its row

#### Scenario: Long city at 320 px
- **GIVEN** the interface language is Russian and the stored location is Петропавловск-Камчатский
- **WHEN** the Cards view is shown 320 px wide
- **THEN** the time and the location menu button are on a line of their own at the right edge of the card
- **AND** the button does not overlap the time and lies inside the card

#### Scenario: Open menu inside the screen
- **GIVEN** the stored locations are Almaty and Moscow
- **WHEN** the user opens Moscow's location menu `<width>` px wide in the `<view>` view
- **THEN** the open menu lies inside the screen

| view | width |
|---|---|
| Cards | 320 |
| Grid | 390 |

#### Scenario: Keyboard
- **GIVEN** the list is Almaty and Moscow
- **WHEN** the user focuses Moscow's location menu button and presses Enter
- **THEN** the menu opens with focus on its first enabled item
- **WHEN** the user presses Esc
- **THEN** the menu is closed and focus is on Moscow's location menu button

#### Scenario: The menu does not start a reorder
- **GIVEN** the list is Almaty and Moscow
- **WHEN** the user opens Moscow's location menu with a pointer
- **THEN** the list order is unchanged

#### Scenario: The menu is locked in Grid while a meeting range is set
- **GIVEN** the Grid view with Almaty and Moscow and the meeting range 09:00–11:00 in Almaty
- **WHEN** the user clicks Moscow's location menu button
- **THEN** no menu opens and the button is disabled
- **WHEN** the user clears the meeting range and clicks Moscow's location menu button
- **THEN** the menu opens with "Move up" and "Move down"

#### Scenario: Keyboard opens the menu on the first enabled item
- **GIVEN** the list is Almaty, Moscow and home is Almaty
- **WHEN** the user focuses Almaty's location menu button and presses Arrow Down
- **THEN** the menu is open with focus on "Clear home"
- **WHEN** the user presses Arrow Down
- **THEN** focus is on "Move down", skipping the disabled "Move up"
- **WHEN** the user presses Esc
- **THEN** the menu is closed and focus is on Almaty's location menu button

#### Scenario: Opening the menu moves nothing
- **GIVEN** the list is Almaty, Moscow
- **WHEN** the user opens Moscow's location menu with the mouse
- **THEN** the list order and every day track's handle are unchanged
