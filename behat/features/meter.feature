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
    When I visit "/#/dashboard/1/marker/7"
    Then I should see a marker selected

  @javascript
  Scenario: Show only meters of a selected in a category
    Given I login with user "carlos"
    When I visit "/#/dashboard/1/marker/7?categoryId=5"
    Then I should see a marker selected

  @javascript
  Scenario: Show only meters of the category selected
    Given I login with user "carlos"
    When I visit "/#/dashboard/1/category/14"
    Then I should see "2" markers

  @javascript
  Scenario: Show only meters not filter in the category menu.
    Given I login with user "carlos"
    When I visit "/#/dashboard/1"
    Then I should see "3" markers
    And I uncheck the box "מבנה חינוך"
    And the "מבנה חינוך" checkbox should not be checked
    And I should see "1" markers
    And I check the box "מבנה חינוך"
    And I uncheck the box "בטחון"
    And the "בטחון" checkbox should not be checked
    And I should see "2" markers

  @javascript @wip
  Scenario: Show only meters of the category selected
    Given I login with user "carlos"
    When I visit "/#/dashboard/1"
    Then I click meter "4"
    Then I see a marker "4" selected
