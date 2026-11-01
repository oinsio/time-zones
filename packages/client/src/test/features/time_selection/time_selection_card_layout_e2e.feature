Feature: Location card layout in a real browser
  Implements change fix-location-card-and-header-layout.
  The wall-time hint is the bottom line of its card, the handle takes the fill
  of its card, and in the 12-hour format every day track is equally long with
  its hour labels on one line.

  Background:
    Given the current time is "2026-03-08T07:30:00Z"

  @fix-location-card-and-header-layout @FR1 @NFR-A2 @UX1
  Scenario Outline: The hint is the bottom line of its card at <width> px
    Given the stored locations are "Almaty", "New York"
    And the screen is <width> px wide for the locations
    And the user opens the locations app
    And the place, time, track and menu of "New York" are noted
    When the page shows a GAP hint
    Then the hint is the bottom line of the card of "New York"
    And the place, time, track and menu of "New York" have not moved

    Examples:
      | width |
      | 375   |
      | 1024  |

  @fix-location-card-and-header-layout @FR2 @UX4
  Scenario Outline: The handle is filled with its card's fill at <width> px with <source>
    Given <system>
    And <preferences>
    And the stored locations are "Almaty"
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then the visible handle of "Almaty" is filled with the fill of its card

    Examples:
      | width | source | system | preferences |
      | 375 | dark system | the system colour scheme is dark | the stored preferences are theme System and hour format 24-hour |
      | 1024 | dark system | the system colour scheme is dark | the stored preferences are theme System and hour format 24-hour |
      | 375 | dark preference | the system colour scheme is light | the stored preferences are theme Dark and hour format 24-hour |
      | 1024 | dark preference | the system colour scheme is light | the stored preferences are theme Dark and hour format 24-hour |
      | 1024 | light | the system colour scheme is light | the stored preferences are theme Light and hour format 24-hour |

  @fix-location-card-and-header-layout @FR2 @UX4
  Scenario Outline: In the dark theme the handle is not the page background at <width> px with <source>
    Given <system>
    And <preferences>
    And the stored locations are "Almaty"
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then the visible handle of "Almaty" is not filled with the page background colour

    Examples:
      | width | source | system | preferences |
      | 375 | dark system | the system colour scheme is dark | the stored preferences are theme System and hour format 24-hour |
      | 1024 | dark system | the system colour scheme is dark | the stored preferences are theme System and hour format 24-hour |
      | 375 | dark preference | the system colour scheme is light | the stored preferences are theme Dark and hour format 24-hour |
      | 1024 | dark preference | the system colour scheme is light | the stored preferences are theme Dark and hour format 24-hour |

  @fix-location-card-and-header-layout @FR5 @FR6 @UX3
  Scenario Outline: Equal tracks in the 12-hour format at <width> px
    Given the stored preferences are theme System and hour format 12-hour
    And the stored locations are "Moscow", "New York", "Tokyo", "Kolkata"
    And the screen is <width> px wide for the locations
    When the user opens the locations app
    Then the time buttons show:
      | city     | time     |
      | Moscow   | 10:30 AM |
      | New York | 3:30 AM  |
      | Tokyo    | 4:30 PM  |
      | Kolkata  | 1:00 PM  |
    And the tracks of the cards are equally long
    And the time columns of the cards are equally wide
    And the hour labels of "Moscow", "New York", "Tokyo", "Kolkata" are on one line and end at the track's right edge
    And the time buttons of "Moscow", "New York", "Tokyo", "Kolkata" show their time on one line in full

    Examples:
      | width |
      | 768   |
      | 1024  |
      | 1440  |

  @fix-location-card-and-header-layout @FR6 @add-interface-language-selection @FR8
  Scenario: Hour labels on one line in Russian
    Given the locations interface language is Russian
    And the stored preferences are theme System and hour format 12-hour
    And the stored locations are "Москва", "Kolkata"
    And the screen is 1024 px wide for the locations
    When the user opens the locations app
    Then the hour labels of "Москва", "Kolkata" are on one line and end at the track's right edge
    And the locations page language is "ru"

  @fix-location-card-and-header-layout @NFR-R1
  Scenario Outline: Tracks in the 12-hour format fit <width> px
    Given the stored preferences are theme System and hour format 12-hour
    And the stored locations are "Almaty", "Kathmandu", "New York", "Tokyo"
    And the screen is <width> px wide for the locations
    And the user opens the locations app
    And the user types a time in the GAP and gets its hint in the 12-hour format
    Then the locations screen does not scroll horizontally

    Examples:
      | width |
      | 320   |
      | 768   |
      | 2560  |

  @fix-location-card-and-header-layout @NFR-A1
  Scenario Outline: No accessibility violations with a hint in the 12-hour format at <width> px in the <theme> theme
    Given the locations screen uses the <theme> theme
    And the stored preferences are theme System and hour format 12-hour
    And the stored locations are "Almaty", "New York"
    And the screen is <width> px wide for the locations
    And the user opens the locations app
    When the user types a time in the GAP and gets its hint in the 12-hour format
    Then the locations screen has no accessibility violations

    Examples:
      | width | theme |
      | 375   | light |
      | 375   | dark  |
      | 1024  | light |
      | 1024  | dark  |
