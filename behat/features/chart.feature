Feature: Chart
  In order to check charts
  As authenticated user
  We need to be able see chart.

  @javascript @wip
  Scenario: Show chart usage monthly of the total kws of the meters.
    Given I login with user "carlos"
    When I visit "/#/dashboard/1"
    Then I see the monthly kws chart of all meters

  @javascript @wip
  Scenario: Show chart usage monthly of a selected meter.
    Given I login with user "carlos"
    When I visit "/#/dashboard/1/marker/4?chartFreq=2"
    Then I see the monthly kws chart a meter