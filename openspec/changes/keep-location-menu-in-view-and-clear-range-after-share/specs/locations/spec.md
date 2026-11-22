## ADDED Requirements

### Requirement: Location menu opens where it fits
In the Cards view and the Grid view, an open location menu SHALL lie wholly inside the viewport, 4 px from its button and at least 4 px from the top and the bottom edge of the viewport. It MUST open under its button when the whole menu fits between the button and the bottom of the viewport. Otherwise it MUST open above the button when the whole menu fits between the top of the viewport and the button. When it fits on neither side, it MUST open on the side with more room, with its height limited to that room. Its border and shadow then surround the visible part, and its items MUST scroll inside it, so that every item can be reached by the arrow keys, by scrolling inside the menu and by a tap. Horizontally it stays right-aligned to its button and inside the screen. While it is open, the menu MUST follow its button when the page or the grid panel scrolls or the window is resized, and it MUST choose its side again by the same rule. Opening it by a pointer, a finger or a key MUST NOT scroll the page. A focused item of a menu with a limited height MUST be scrolled into the menu's view. At the centre of every item inside the menu's visible box, the topmost element MUST be that item, also over the date bar. Its look, its items, their order and the keyboard behaviour of "Location menu" do not change. With a menu open above its button or with a limited height, axe-core SHALL report no violations in the light and the dark theme. Opening the menu MUST read the layout of the button and of the menu once, and so must each scroll or resize event while it is open, without a `ResizeObserver` and without a timer. Inputs: the position of the button in the viewport, the height of the menu's items, the height of the viewport. Output: the side and the height of the open menu. Errors: none. <!-- implements FR1, FR2, FR3, FR4, NFR-P1, NFR-A1, NFR-A2, NFR-R1, UX1, UX2 of keep-location-menu-in-view-and-clear-range-after-share -->

#### Scenario: The menu of the last row opens above its button
- **GIVEN** the `<view>` view at `<size>` px with 12 locations
- **AND** the page is scrolled to the end
- **WHEN** the user opens the location menu of the last row
- **THEN** the menu lies above its button and wholly inside the viewport
- **AND** "Move up", "Move down" and "Remove" are visible
- **AND** the page has not scrolled

| view | size |
|---|---|
| Cards | 320 × 568 |
| Cards | 390 × 844 |
| Cards | 844 × 390 |
| Grid | 320 × 568 |
| Grid | 390 × 844 |
| Grid | 844 × 390 |

#### Scenario: The menu of the first row opens under its button
- **GIVEN** the `<view>` view at `<size>` px with 12 locations and the page at its top
- **WHEN** the user opens the location menu of the first row
- **THEN** the menu lies under its button and wholly inside the viewport
- **AND** the page has not scrolled

| view | size |
|---|---|
| Cards | 320 × 568 |
| Cards | 390 × 844 |
| Cards | 844 × 390 |
| Grid | 320 × 568 |
| Grid | 390 × 844 |
| Grid | 844 × 390 |

#### Scenario: Choosing the side
- **GIVEN** a menu 184 px high, a viewport 600 px high and the 4 px gaps
- **WHEN** the button's top is at `<top>` px and its bottom at `<bottom>` px
- **THEN** the menu opens `<side>` with a height of `<height>` px

| top | bottom | side | height |
|---|---|---|---|
| 100 | 144 | under the button | 184 |
| 360 | 404 | under the button | 184 |
| 420 | 464 | above the button | 184 |
| 550 | 594 | above the button | 184 |

#### Scenario: No room on either side
- **GIVEN** a menu 184 px high, a viewport 300 px high and the 4 px gaps
- **WHEN** the button's top is at `<top>` px and its bottom at `<bottom>` px
- **THEN** the menu opens `<side>` with a height of `<height>` px and its items scroll

| top | bottom | side | height |
|---|---|---|---|
| 100 | 144 | under the button | 148 |
| 160 | 204 | above the button | 152 |

#### Scenario: The menu follows a scroll
- **GIVEN** the Grid view at 390 × 844 px with 12 locations and the menu of a row in the middle of the screen open under its button
- **WHEN** the page is scrolled down by 300 px
- **THEN** the menu is still 4 px from its button and wholly inside the viewport

#### Scenario: Every item of a limited menu can be reached by the keyboard
- **GIVEN** the Cards view at 844 × 390 px with 12 locations
- **AND** the page is scrolled so that a row's location menu button is in the middle of the viewport, where the four items fit neither under nor above it
- **WHEN** the user opens that menu with Enter and presses Arrow Up once
- **THEN** the menu has a limited height and lies wholly inside the viewport
- **AND** the focus is on "Remove" and "Remove" lies inside the menu's visible box

#### Scenario: The menu lies over the date bar
- **GIVEN** the `<view>` view at 390 × 844 px with 12 locations and the page scrolled to the end
- **WHEN** the user opens the location menu of the last row
- **THEN** at the centre of every item of the menu the topmost element is that item

| view |
|---|
| Cards |
| Grid |

#### Scenario: No accessibility violations with the menu opened above
- **GIVEN** the `<view>` view at 390 × 844 px in the `<theme>` theme with 12 locations and the page scrolled to the end
- **WHEN** the user opens the location menu of the last row
- **THEN** the screen has no accessibility violations

| view | theme |
|---|---|
| Cards | light |
| Cards | dark |
| Grid | light |
| Grid | dark |
