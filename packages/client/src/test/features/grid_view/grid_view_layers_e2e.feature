Feature: Grid layers under the page bars and dialogs in a real browser
  Implements change fix-grid-meeting-range-lock-and-layering.
  Nothing of the grid panel paints over the date bar or a dialog, an open location menu lies above the date bar, and the frame borders run through the empty parts of a row header.

  @fix-grid-meeting-range-lock-and-layering @FR6
  Scenario Outline: Dialogs cover the grid with <state> and <dialog>
    Given the locations interface language is English
    And the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 390 by 844 px for the locations
    When the user opens the locations app
    And the grid shows <state>
    And the user brings up <dialog>
    Then every row header text, hour cell and meeting handle under the backdrop has the dialog or its backdrop on top

    Examples:
      | state                         | dialog          |
      | the hour frame | the search      |
      | the hour frame | the calendar    |
      | the meeting range 09:00–11:00 | the calendar    |

  @fix-grid-meeting-range-lock-and-layering @FR7
  Scenario: Rows scroll under the date bar
    Given the locations interface language is English
    And the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow", "Kolkata", "Kathmandu", "Tokyo", "New York", "Belgrade", "Lord Howe Island", "Chicago", "Adelaide", "St. Vincent", "London"
    And the screen is 390 by 844 px for the locations
    When the user opens the locations app
    And the user sets the sample meeting
    And the page is scrolled so that rows pass under the date bar
    Then the topmost element at the centre of the calendar button and of the Now button is that button
    And no point of the date bar has a grid element on top

  @fix-grid-meeting-range-lock-and-layering @FR7
  Scenario: An open location menu lies above the date bar
    Given the locations interface language is English
    And the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow", "Kolkata", "Kathmandu", "Tokyo", "New York", "Belgrade", "Lord Howe Island", "Chicago", "Adelaide", "St. Vincent", "London"
    And the screen is 390 by 844 px for the locations
    When the user opens the locations app
    And the page is scrolled so that the menu button of "Tokyo" lies just above the date bar
    And the user opens the location menu of "Tokyo"
    Then every menu item over the date bar has that menu item on top
    And at least one menu item lies over the date bar

  @fix-grid-meeting-range-lock-and-layering @FR8 @UX3
  Scenario Outline: The frame border runs through the empty parts of the header at <width> px with <frame>
    Given the locations interface language is English
    And the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is <width> by <height> px for the locations
    When the user opens the locations app
    And the grid shows <frame>
    Then no border point of the frame in a row header is covered by a background beside a glyph, a row note or an input
    And every row has a border point in an empty part of its header

    Examples:
      | width | height | frame                         |
      | 390   | 844    | the hour frame |
      | 390   | 844    | the meeting range 09:00–11:00 |
      | 1440  | 900    | the hour frame |
      | 1440  | 900    | the meeting range 09:00–11:00 |

  @fix-grid-meeting-range-lock-and-layering @NFR-R2
  Scenario Outline: Approved screenshots with a dialog open at <width> by <height> px with <dialog>
    Given the view mode is Grid
    And the locations interface language is Russian
    And the current time is "2026-03-08T07:30:00Z"
    And the list holds "Almaty", "Moscow", "Kolkata", "New York" and home is "Almaty"
    And the locations screen uses the light theme
    And the screen is <width> by <height> px for the locations
    When the user opens the locations app
    And the grid shows <state>
    And the user brings up <dialog>
    Then the locations screen matches the approved screenshot

    Examples:
      | width | height | state                         | dialog       |
      | 390   | 844    | the hour frame                | the search   |
      | 1440  | 900    | the meeting range 09:00–11:00 | the calendar |
