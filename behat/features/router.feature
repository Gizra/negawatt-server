Feature: Router
  In order to check the router system
  As user
  We need to be able navigate between states.

  @javascript
  Scenario: Authenticate user have to see homepage when set url "/"
    Given I login with user "carlos"
    When I visit "/"
    Then I should see "3" markers

  @javascript
  Scenario: Anonymous user have to see login page when set url "/"
    Given I am an anonymous user
    When I visit "/"
    Then I should see the login page
