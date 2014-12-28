Feature: Meter
  In order to view the location of the meters
  As authenticated user
  We need to be able view the meters as markers on the map

  @javascript @wip
  Scenario: Show all meters of the account
    Given I login with user "carlos"
    When I visit "#/dashboard"
    Then I should see all the markers
