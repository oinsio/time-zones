Feature: Zone rules release line
  The settings page names the zone rules release the app runs on, after the deploy time.

  @add-remote-zone-rules-updates @FR8
  Scenario Outline: The line in both languages
    Given the active release is "2026f"
    When the settings page is shown in "<language>"
    Then the line after the deploy time reads "<text>"

    Examples:
      | language | text                          |
      | English  | Time zone rules: 2026f        |
      | Russian  | Правила часовых поясов: 2026f |

  @add-remote-zone-rules-updates @FR8
  Scenario: The line names the active release
    Given the bundled release is "2026f" and the stored release "2026g" is active
    When the settings page is shown in "English"
    Then the line after the deploy time reads "Time zone rules: 2026g"

  @add-remote-zone-rules-updates @FR8
  Scenario: No active release
    Given the zone rules failed to load at start
    When the settings page is shown in "English"
    Then the deploy time is the last line and no release line is shown
