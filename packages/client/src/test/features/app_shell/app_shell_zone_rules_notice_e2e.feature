Feature: Zone rules update notice in a real browser
  Implements change add-remote-zone-rules-updates.
  As a user I am told that newer zone rules are ready, handle the notice with the keyboard and find the page accessible.

  @add-remote-zone-rules-updates @FR7 @UX1
  Scenario: The notice appears for a newer published release
    Given a newer zone rules release is published
    When the user opens the app
    Then the zone rules update notice names the published release

  @add-remote-zone-rules-updates @FR7 @UX1 @NFR-A1
  Scenario: Keyboard user handles the notice
    Given a newer zone rules release is published
    When the user opens the app
    Then the keyboard reaches Reload and the dismiss control of the zone rules update notice
    And the page heading stays in the viewport
    And Enter on the dismiss control hides the zone rules update notice

  @add-remote-zone-rules-updates @FR7 @UX1 @NFR-A1
  Scenario: Escape dismisses the notice
    Given a newer zone rules release is published
    When the user opens the app
    And the user dismisses the zone rules update notice with Escape
    Then the zone rules update notice is hidden

  @add-remote-zone-rules-updates @NFR-A1
  Scenario Outline: No accessibility violations with the zone rules update notice in the <color scheme> theme
    Given the system prefers the <color scheme> color scheme
    And a newer zone rules release is published
    When the user opens the app
    Then the zone rules update notice names the published release
    And the page has no accessibility violations

    Examples:
      | color scheme |
      | light        |
      | dark         |
