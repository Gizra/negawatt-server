Feature: Chart
  In order to check charts
  As authenticated user
  We need to be able see chart.

  @javascript
  Scenario: Show chart usage monthly of the total kws of the meters.
    Given I login with user "carlos"
    When I visit "/#/dashboard/1"
    Then I should see the monthly kws chart of all meters

  @javascript
  Scenario: Show chart usage monthly of a selected meter.
    Given I login with user "carlos"
    When I visit "/#/dashboard/1/marker/5?chartFreq=2"
    Then I should see a marker selected
    Then I should see the monthly kws chart a meter

  @javascript
  Scenario: Show chart monthly electricity data from diferent periods.
    Given I login with user "carlos"
    When I visit "/#/dashboard/1"
    And I press the "previous" button on the charts
    Then I should see the previous monthly kws chart of all meters
    And I press the "next" button on the charts
    Then I should see the monthly kws chart of all meters
