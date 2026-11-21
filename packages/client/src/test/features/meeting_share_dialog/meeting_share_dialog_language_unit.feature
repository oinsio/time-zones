Feature: Share dialog language and pin
  Implements change add-meeting-share-dialog.
  As a user I decide which locations, which language and which zone parts the meeting share text has, read it and send it.

  Background:
    Given the interface language is Russian, the hour format is 24-hour and nothing is stored in the preferences
    And the Grid view shows the sample meeting 09:00–11:00 in Almaty on 2026-03-08 with the list Almaty, Moscow, Kolkata, New York

  @add-meeting-share-dialog @FR4
  Scenario: Another share language
    Given the user chose "English" as the share language
    Then the preview is the English text of the sample meeting
    And the dialog's captions and rows are still in Russian and the interface language is Russian

  @add-meeting-share-dialog @FR4
  Scenario: The device time location in another share language
    Given the list is the device time location, Moscow, Kolkata and New York, with no home location
    And the user chose "English" as the share language
    Then the first line of the preview after the heading starts with "Almaty" and no line contains a Cyrillic letter
    And the first row of the dialog still reads "Алматы"

  @add-meeting-share-dialog @FR5
  Scenario: Without the pin the dialog returns to the interface language
    Given the user chose "English" as the share language and closed the dialog without pinning
    When the user chooses "Поделиться встречей"
    Then the share language is "Русский"

  @add-meeting-share-dialog @FR5
  Scenario: A pinned language opens every time
    Given the user chose "English" as the share language and turned the pin on
    When the app is opened again, a meeting range is set and the share dialog is opened
    Then the share language is "English" and "English" is the pinned share language
    And the interface language is Russian

  @add-meeting-share-dialog @FR5
  Scenario: Changing the language while pinned
    Given the share language "English" is pinned
    When the user chooses "Русский" as the share language
    Then the pinned share language is "Русский"

  @add-meeting-share-dialog @FR5
  Scenario: Turning the pin off
    Given the share language "English" is pinned and the dialog is open
    When the user turns the pin off
    Then no share language is pinned and the share language of this dialog is still "English"
