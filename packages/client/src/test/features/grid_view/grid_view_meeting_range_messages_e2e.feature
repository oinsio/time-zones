Feature: Refusal messages of the meeting range input in a real browser
  Implements change refine-meeting-range-entry-and-handles.
  Each refusal of a typed meeting range is named in a message the page keeps accessible.

  Background:
    Given the locations interface language is English
    And the view mode is Grid
    And the current time is "2026-03-08T07:30:00Z"
    And the stored locations are "Almaty", "Moscow", "Kolkata", "New York"
    And the screen is 1440 by 900 px for the locations

  @refine-meeting-range-entry-and-handles @NFR-A1 @FR3
  Scenario Outline: No accessibility violations with each range message in the <theme> theme, <start> to <end> in <city>
    Given the locations screen uses the <theme> theme
    When the user opens the locations app
    And the user sets the sample meeting
    And the user opens the meeting range input of "<city>"
    And the user confirms "<start>" and "<end>" in the meeting range input of "<city>"
    Then the meeting range input of "<city>" shows the message "<message>"
    And the meeting state has no accessibility violations

    Examples:
      | theme | city     | start | end | message                                |
      | light | Almaty   | 10:00 | 10:00 | The meeting start and end are the same |
      | light | Almaty   | 12:00 | 10:00 | The meeting must end after it starts   |
      | light | New York | 13:00 | 14:00 | The meeting must lie within the day    |
      | dark  | Almaty   | 10:00 | 10:00 | The meeting start and end are the same |
      | dark  | Almaty   | 12:00 | 10:00 | The meeting must end after it starts   |
      | dark  | New York | 13:00 | 14:00 | The meeting must lie within the day    |
