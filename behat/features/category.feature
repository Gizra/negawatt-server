Feature: Category
  In order to check markers filter by category
  As authenticated user
  We need to be able select a category and filter the markers.

  @javascript
  Scenario: Show category selected active
    Given I login with user "carlos"
    When I visit "/#/dashboard/1/category/5"
    Then I should see the category active

  @javascript
  Scenario: Show highlight the active category with a meter selected
    Given I login with user "carlos"
    When I visit "/#/dashboard/1/marker/10?categoryId=14"
    Then I should see the category active

  @javascript
  Scenario: Hide filter meters checkbox in a category selection
    Given I login with user "carlos"
    When I click "בטחון"
    Then I should not see the filters

  @javascript
  Scenario: Show filter meters checkbox in parent category.
    Given I login with user "carlos"
    When I visit "/#/dashboard/1"
    Then the "מבנה חינוך" checkbox should be checked

  @javascript
  Scenario: Show all categories unselected
    Given I login with user "carlos"
    When I visit "/#/dashboard/1/category/5"
    And I should see the category active
    And I click "menu-home-link"
    Then I should see all categories inactive

  @javascript
  Scenario: Show filter meters checkboxs when select a meter.
    Given I login with user "carlos"
    When I reload "/#/dashboard/1/marker/9"
    And I should see a marker selected
    Then the "מבנה חינוך" checkbox should be checked
    And the "בטחון" checkbox should be checked
