Feature: Open the location search with the slash key
  Implements change open-location-search-with-slash-shortcut.

  Background:
    Given the view under contract is shown

  @open-location-search-with-slash-shortcut @view-contract @FR1 @FR5 @NFR-A1 @UX1 @UX2 @M4
  Scenario: Add a location after opening the search with the slash key
    When the user presses "/" on the main page
    Then the search is open with focus in an empty query field
    And the "/" key press did not reach the browser
    And the suggestions are shown
    When the user picks "Tokyo" in the search with the keyboard
    Then the locations list shows "Tokyo"
    And focus is on the "Add location" action
    And the "Add location" action announces the "/" keyboard shortcut

  @open-location-search-with-slash-shortcut @view-contract @NFR-P1
  Scenario: The slash key loads the search data only when it opens the search
    Then the page has not requested the search data
    When the user presses "/" on the main page
    Then the page has requested the search data

  @open-location-search-with-slash-shortcut @view-contract @FR2 @M2
  Scenario Outline: The slash key is typed into a <field>
    Given a <field> outside the search has focus
    When the user presses "/"
    Then the search does not open
    And the focused field holds "/"

    Examples:
      | field                  |
      | text input             |
      | textarea               |
      | contenteditable element |

  @open-location-search-with-slash-shortcut @view-contract @FR3 @M2
  Scenario: The slash key is typed into the open search's query
    When the user presses "/" on the main page
    And the user presses "/"
    Then exactly one search is open
    And the query field holds "/"

  @open-location-search-with-slash-shortcut @view-contract @FR3 @M2
  Scenario: The slash key on the close action keeps the search as it is
    When the user presses "/" on the main page
    And focus moves to the close action of the search
    And the user presses "/"
    Then exactly one search is open
    And the query field holds ""

  @open-location-search-with-slash-shortcut @view-contract @FR4 @M2
  Scenario Outline: The slash key with <modifier> held does not open the search
    When the user presses "/" holding <modifier> on the main page
    Then the search does not open

    Examples:
      | modifier |
      | Control  |
      | Meta     |
      | Alt      |

  @open-location-search-with-slash-shortcut @view-contract @FR4
  Scenario: The slash key typed with Shift opens the search
    When the user presses "/" with Shift on a layout that needs it
    Then the search is open with focus in an empty query field

  @open-location-search-with-slash-shortcut @view-contract @FR6
  Scenario: The slash key does nothing while the stored list is unreadable
    When the locations are in the unreadable state
    And the user presses "/" on the main page
    Then the search does not open
