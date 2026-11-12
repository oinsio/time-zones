Feature: Zone rules budgets
  As a user I keep a fast app: the zone rules add a small asset and bounded work.

  @add-zone-rules-from-iana @NFR-P1
  Scenario: Asset budget
    When the committed zone rules release is measured gzipped
    Then it is at most the asset budget

  @add-zone-rules-from-iana @NFR-P3
  Scenario: Work bound of a lookup
    When the local time type of "Asia/Almaty" is read at 100 instants
    Then no Intl.DateTimeFormat is built
    And no native formatToParts call is made

  @add-zone-rules-from-iana @NFR-P3
  Scenario: Work bound of the wrapper
    When one formatter for "Asia/Almaty" is created and split into parts at 100 instants
    Then exactly one native Intl.DateTimeFormat is built
    And exactly 100 native formatToParts calls are made

  @add-zone-rules-from-iana @NFR-P1 @NFR-P3
  Scenario: Work bound of presenting rows
    When 50 rows are presented twice at two instants
    Then the second presentation builds no Intl.DateTimeFormat
