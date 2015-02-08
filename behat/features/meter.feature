Feature: Meter
  In order to view the location of the meters
  As authenticated user
  We need to be able view the meters as markers on the map

  @javascript
  Scenario: Show all meters of the account
    Given I login with user "carlos"
    When I visit "/#/dashboard/1"
    Then I should see "3" markers

  @javascript
  Scenario: Show only meters of a selected
    Given I login with user "carlos"
    When I visit "/#/dashboard/1/marker/5?categoryId=15"
    Then I should see a marker selected
