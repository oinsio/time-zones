Feature: Zone rules release order
  Zone rules releases are ordered by year, then by the length of their letters, then alphabetically.

  @add-remote-zone-rules-updates @FR5
  Scenario Outline: Ordered pairs
    When "<earlier>" and "<later>" are compared
    Then "<earlier>" is older than "<later>", "<later>" is newer than "<earlier>", and each equals itself

    Examples:
      | earlier | later |
      | 2026a   | 2026b |
      | 2026b   | 2026z |
      | 2026z   | 2026aa |
      | 2026aa  | 2026ab |
      | 2025z   | 2026a |
      | 2024a   | 2026a |

  @add-remote-zone-rules-updates @FR5
  Scenario Outline: Invalid names
    When "<name>" is read as a release name
    Then it is invalid

    Examples:
      | name   |
      | 2026   |
      | 2026A  |
      | 26a    |
      | latest |
