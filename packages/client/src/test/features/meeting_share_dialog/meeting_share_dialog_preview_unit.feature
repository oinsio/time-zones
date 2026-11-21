Feature: Share dialog zone label and preview
  Implements change add-meeting-share-dialog.
  As a user I decide which locations, which language and which zone parts the meeting share text has, read it and send it.

  Background:
    Given the interface language is Russian, the hour format is 24-hour and nothing is stored in the preferences
    And the Grid view shows the sample meeting 09:00–11:00 in Almaty on 2026-03-08 with the list Almaty, Moscow, Kolkata, New York

  @add-meeting-share-dialog @FR6
  Scenario: Turning the UTC offset off
    Given the share dialog is open
    When the user turns "Смещение UTC" off
    Then the preview line of Moscow is "Москва (МСК): 07:00–09:00" and the preview line of Almaty is "Алматы: 09:00–11:00"
    And the rows of the Grid view still show their zone lines with the UTC offset

  @add-meeting-share-dialog @FR6
  Scenario: The choice is used the next time
    Given the user turned "Аббревиатура" off and closed the dialog
    When the user chooses "Поделиться встречей"
    Then "Аббревиатура" is off and "Смещение UTC" is on

  @add-meeting-share-dialog @FR8
  Scenario: The preview is the text that is shared
    Given a browser with a system share and the share dialog open
    When the user unticks "Москва", chooses "English" as the share language and chooses "Поделиться"
    Then the system share receives exactly the lines the preview showed

  @add-meeting-share-dialog @FR8
  Scenario: The preview follows the ticks
    Given the share dialog is open
    When the user unticks "Калькутта"
    Then the preview has the heading and the lines of Almaty, Moscow and New York, in that order
