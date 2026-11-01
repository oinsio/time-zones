Feature: The Gnomish Factory name in every interface language
  Implements change keep-gnomish-factory-name-untranslated-in-credit.
  As a user I read the brand name of the Gnomish Factory the same way in every
  interface language.

  @keep-gnomish-factory-name-untranslated-in-credit @FR2 @UX1
  Scenario: The factory name in every supported interface language
    When the Gnomish Factory credit is read in every supported interface language
    Then every credit contains the factory name "Gnomish Factory"
