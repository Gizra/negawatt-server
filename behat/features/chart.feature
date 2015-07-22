Feature: Chart
  In order to check charts
  As authenticated user
  We need to be able see chart.

  @javascript
  Scenario: Show chart usage monthly of the total kws of the meters.
    Given I login with user "carlos"
    When I reload "/#/dashboard/1"
    Then I should see a chart from "7,836" KW to "12,318" KW average power

  @javascript
  Scenario: Show pie chart with total kws of the categories.
    Given I login with user "carlos"
    When I reload "/#/dashboard/1"
    Then I should see category "בטחון" with "98,815" Kws
    And I should see category "מבנה חינוך" with "96,654" Kws

  @javascript
  Scenario: Show pie chart total kws of the subcategory of security.
    Given I login with user "carlos"
    When I reload "/#/dashboard/1"
    And  I should see the category "בטחון"
    And I click "בטחון"
    Then I should see category "מקלט" with "98,815" Kws

  @javascript
  Scenario: Show pie chart total kws of the meters.
    Given I login with user "carlos"
    When I reload "/#/dashboard/1"
    And  I should see the category "מקלט"
    And I click "מקלט"
    Then I should see the contract "9,311,819" with "46,166" Kws
    And I should see the contract "968,881" with "52,649" Kws

  @javascript @wip
  Scenario: Show chart usage monthly of a selected meter.
    Given I login with user "carlos"
    When I visit "/#/dashboard/1/marker/10?chartFreq=2"
    Then I should see a marker selected
    Then I should see the monthly kws chart of a meter

  @javascript @wip
  Scenario: Show chart monthly electricity data from different periods.
    Given I login with user "carlos"
    When I visit "/#/dashboard/1"
    And I press the "previous" button on the charts
    Then I should see the previous monthly kws chart of all meters
    And I press the "next" button on the charts
    Then I should see the monthly kws chart of all meters

  @javascript @wip
  Scenario: Show not enough data message into the usage chart.
    Given I login with user "carlos"
    When I reload "/#/dashboard/1?chartFreq=3"
    Then I should see "אין מספיק נתונים כדי להציג את התרשים." in the chart of kws usage

  @javascript @wip
  Scenario: Show chart usage monthly for multiple meters.
    Given I login with user "carlos"
    When I visit "/#/dashboard/1/marker/9,10"
    Then I should see the monthly kws chart for multiple markers

  @javascript @wip
  Scenario: Show chart monthly electricity data of previous period on enter URL.
    Given I login with user "carlos"
    When I reload "/#/dashboard/1"
    And I should see the monthly kws chart of all meters
    Then I reload "/#/dashboard/1?chartFreq=2&chartNextPeriod=1363960337&chartPreviousPeriod=1300801937"
    And I should see the previous monthly kws chart of all meters
