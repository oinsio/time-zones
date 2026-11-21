Feature: Share dialog budget
  Implements change add-meeting-share-dialog.
  As a user I decide which locations, which language and which zone parts the meeting share text has, read it and send it.

  Background:
    Given the interface language is Russian, the hour format is 24-hour and nothing is stored in the preferences
    And the Grid view shows the sample meeting 09:00–11:00 in Almaty on 2026-03-08 with the list Almaty, Moscow, Kolkata, New York

  @add-meeting-share-dialog @NFR-P1
  Scenario: A tick builds no formatter
    Given the share dialog is open with 20 locations
    When the user unticks one location and ticks it again
    Then no Intl formatter was built by these two changes

  @add-meeting-share-dialog @NFR-P1
  Scenario: Returning to a used language builds no formatter
    Given the user chose "English" and then "Русский" as the share language
    When the user chooses "English" again
    Then no Intl formatter was built by this change
