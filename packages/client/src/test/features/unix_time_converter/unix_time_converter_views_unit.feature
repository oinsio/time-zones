Feature: The converter views
  Implements change add-unix-time-converter-tool.
  As a user I see the same moment in whichever view the app offers.

  @add-unix-time-converter-tool @FR17
  Scenario: A second view shows the same moment
    Given a test registry whose first view is a test view
    When the user opens the converter and the test view sends the text "1795432987123"
    Then the test view receives the Moscow row with the time "14:23:07.123"
