Feature: The Unix time converter
  Implements change add-unix-time-converter-tool.
  As a user I see one moment in every place of my list, edit it in any field
  and copy it in the notation I need.

  @add-unix-time-converter-tool @FR9
  Scenario: Rows of the sample
    When the user opens the converter
    And the user types "1795432987123" into the converter input
    Then the rows are, in order:
      | city     | time         |
      | Almaty   | 16:23:07.123 |
      | Moscow   | 14:23:07.123 |
      | Kolkata  | 16:53:07.123 |
      | New York | 06:23:07.123 |

  @add-unix-time-converter-tool @FR10
  Scenario Outline: A time typed in a row
    Given the user typed "1795432987" into the converter input
    When the user types "<text>" into the time of the New York row and confirms
    Then the converter input shows "<unix>" and the Moscow row shows "<moscow>"

    Examples:
      | text               | unix                | moscow             |
      | 9                  | 1795442400          | 17:00:00           |
      | 9:30:15            | 1795444215          | 17:30:15           |
      | 9:30:15.5          | 1795444215500       | 17:30:15.500       |
      | 9:30:15.123456789  | 1795444215123456789 | 17:30:15.123456789 |

  @add-unix-time-converter-tool @FR12
  Scenario: Notations of the sample
    When the user types "1795432987123456" into the converter input
    Then the notations are:
      | notation     | text                        |
      | Секунды      | 1795432987                  |
      | Миллисекунды | 1795432987123               |
      | Микросекунды | 1795432987123456            |
      | Наносекунды  | 1795432987123456000         |
      | ISO 8601     | 2026-11-23T11:23:07.123456Z |

  @add-unix-time-converter-tool @FR12
  Scenario: Dropping digits towards the past
    When the user types "-1500" into the converter input
    And the user chooses the unit "Миллисекунды"
    Then the seconds notation is "-2" and the ISO 8601 notation is "1969-12-31T23:59:58.500Z"

  @add-unix-time-converter-tool @FR12
  Scenario: Copy
    Given the user typed "1795432987123" into the converter input
    When the user chooses the copy action of "Секунды"
    Then the clipboard holds "1795432987" and "Скопировано" is announced
    When the browser refuses a copy
    And the user tries the copy action of "Секунды" again
    Then "Не удалось скопировать" is shown beside the action

  @add-unix-time-converter-tool @FR13
  Scenario Outline: Past and future
    When the user types "<text>" into the converter input
    Then the relative time is "<russian>"

    Examples:
      | text        | russian         |
      | 1795432957  | сейчас          |
      | 1795432087  | 15 минут назад  |
      | 1795440187  | через 2 часа    |
      | 1795173787  | 3 дня назад     |
      | 1700000000  | 3 года назад    |
      | 0           | 56 лет назад    |

  @add-unix-time-converter-tool @FR14
  Scenario: Ticking
    When the user opens the converter
    And one second passes
    Then the converter input shows "1795432988" and the Moscow row shows "14:23:08"

  @add-unix-time-converter-tool @FR14
  Scenario: Pinned, then live again
    When the user opens the converter
    And the user types "1700000000" into the converter input
    And one second passes
    Then the converter input shows "1700000000" and "Сейчас" is active
    When the user chooses "Сейчас"
    Then the converter input shows "1795432988" and "Сейчас" is inactive

  @add-unix-time-converter-tool @FR14
  Scenario: Live in a fixed unit
    When the user opens the converter
    And the user chooses the unit "Миллисекунды"
    Then the converter input shows "1795432987000" and "Сейчас" is inactive

  @add-unix-time-converter-tool @FR16
  Scenario Outline: Unreadable texts
    Given the user typed "1795432987" into the converter input
    When the user types "<text>" into the converter input
    Then the message "Введите Unix-время или дату и время в формате ISO 8601" is shown
    And the Moscow row shows "14:23:07"

    Examples:
      | text                      |
      | abc                       |
      | 1795432987,5              |
      | 17,95432987               |
      | 1795432987.1234567890     |
      | 2026-11-23T14:23:07       |
      | 2026-11-23                |

  @add-unix-time-converter-tool @FR16
  Scenario: A fraction under a fixed unit
    Given the user chose the unit "Миллисекунды"
    When the user types "1795432987.5" into the converter input
    Then the message "Введите Unix-время или дату и время в формате ISO 8601" is shown

  @add-unix-time-converter-tool @FR16
  Scenario: Range
    Given the user chose the unit "Секунды"
    When the user types "8640000000000" into the converter input
    Then no message is shown
    When the user types the value "8640000000001" past the range
    Then the message of a value out of range "Значение вне поддерживаемого диапазона дат" is shown

  @add-unix-time-converter-tool @FR9
  Scenario: Empty list
    Given the location list is empty
    When the user opens the converter
    Then exactly one row is shown, for the device time zone, with the time "16:23:07"

  @add-unix-time-converter-tool @FR11
  Scenario: Another day in one location
    Given the user typed "1795432987123" into the converter input
    When the user chooses 24 November 2026 in the calendar of the New York row
    Then the New York row shows the date "вт, 24 нояб." and the time "06:23:07.123"
    And the converter input shows "1795519387123"

  @add-unix-time-converter-tool @FR18
  Scenario: English interface
    Given the interface language is English
    When the user types "abc" into the converter input
    Then the message "Enter a Unix time or an ISO 8601 date and time" is shown
    And the unit options are "Auto", "Seconds", "Milliseconds", "Microseconds", "Nanoseconds"
