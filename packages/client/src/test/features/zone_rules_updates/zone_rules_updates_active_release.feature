Feature: Active release at start
  At start the app makes active the newest readable release: the stored one or the bundled one.

  @add-remote-zone-rules-updates @FR6
  Scenario: Stored release is newer
    Given the bundled release is "2026f" and the stored release is "2026g", whose rule for "Asia/Almaty" is UTC+4
    When the app starts
    Then the active release is "2026g"
    And the offset of "Asia/Almaty" is UTC+4

  @add-remote-zone-rules-updates @FR6
  Scenario Outline: Stored release is older or equal
    Given the bundled release is "2026f" and the stored release is "<stored>"
    When the app starts
    Then the active release is "2026f"
    And the stored release is removed

    Examples:
      | stored |
      | 2026e  |
      | 2026f  |

  @add-remote-zone-rules-updates @FR6
  Scenario Outline: Stored release is unreadable
    Given the stored release document is "<document>"
    When the app starts
    Then the active release is the bundled one
    And the stored document is removed
    And no error is shown

    Examples:
      | document                                       |
      | not valid JSON                                 |
      | an envelope with schema version 2              |
      | an envelope whose payload is not a zone rules release |

  @add-remote-zone-rules-updates @FR6 @NFR-P2
  Scenario: No stored release
    Given nothing is stored
    When the app starts
    Then the active release is the bundled one, storage is read once and only the bundled release is requested

  @add-remote-zone-rules-updates @FR6
  Scenario: The bundled release cannot be loaded
    Given the request for the bundled release fails and the stored release "2026g" is valid
    When the app starts
    Then the active release is "2026g"
