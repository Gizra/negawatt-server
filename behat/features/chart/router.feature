Feature: Router
  In order to check the router system
  As authenticated user
  We need to be able navigate between states.

  @javascript
  Scenario: Authenticate user have to see homepage when set url "/"
    Given I login with user "carlos"
    When I visit "/#/"
    Then I should see detailed-chart title 'קרית גת'
    And I should have 'קוט"ש בחודש' as chart usage label

  @javascript
  Scenario: Set default chart frequency monthly
    Given I login with user "carlos"
    When I visit "/#/chart/1"
    Then I should have 'קוט"ש בחודש' as chart usage label

  @javascript
  Scenario: Keep chart frequency monthly at category selection
    Given I login with user "carlos"
    When I visit "/#/dashboard/1"
    Then I click "בטחון"
    Then I should have 'קוט"ש בחודש' as chart usage label

  @javascript @wip
  Scenario: Remove period parameters when click on a category.
    Given I login with user "carlos"
    When I visit "/#/dashboard/1"
    And I press the "previous" button on the charts
    Then the url should match "chartNextPeriod|chartPreviousPeriod"
    And I click "בטחון"
    And I am on "http://localhost:9000/#/dashboard/1/category/14?chartFreq=2"

  @javascript @wip
  Scenario: Remove period parameters when click on home link.
    Given I login with user "carlos"
    When I visit "/#/dashboard/1"
    And I click meter 9
    And I press the "previous" button on the charts
    Then the url should match "chartNextPeriod|chartPreviousPeriod"
    And I click "menu-home-link"
    And I am on "http://localhost:9000/#/dashboard/1?chartFreq=2"
