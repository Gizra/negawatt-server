Feature: Router
  In order to check the router system
  As authenticated user
  We need to be able navigate between states.

  @javascript @anonymous
  Scenario: Authenticate user have to see homepage when set url "/"
    Given I login with user "carlos"
    When I visit "/"
    Then I should see "3" markers
