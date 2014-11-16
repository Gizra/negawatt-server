Feature: Login
  Assert a user can login.


  @javascript
  Scenario: Login the site
    Given I login with user "carlos"
    Then the dashbaord should be visible

