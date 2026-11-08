Feature: Compact option group
  Implements change compact-settings-controls.
  As a user I choose one of a few options in one compact row, and the choice is
  stored as before.

  @compact-settings-controls @FR6
  Scenario: A group with three options
    Given an option group with the caption "Sample" and the options A, B and C, of which B is checked
    When the user chooses A
    Then the group reports A
    And the options are A, B and C, in this order

  @compact-settings-controls @FR6
  Scenario: An option without an icon or a pictogram shows its name
    Given an option group with the caption "Sample" and an option named "Plain" that has neither an icon nor a pictogram
    When the group is shown
    Then the option shows the text "Plain"

  @compact-settings-controls @FR3
  Scenario: The stored theme is unchanged
    Given no preferences are stored
    When the user chooses the theme Dark and the preferences are written
    Then the stored preferences hold the theme "DARK" and the hour format "H24"
