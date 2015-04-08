Feature: Menu
  In order to check the account information
  As authenticated user
  We need to be able to see account data of the authenticated user.

  @javascript
  Scenario: Show name user name
    Given I login with user "carlos"
    When I visit "/#/dashboard/1"
    Then I should see a greeting as "שלום ,carlos"

  @javascript
  Scenario: Show logo of the account
    Given I login with user "carlos"
    When I visit "/#/dashboard/1"
    Then I should see logo account

  @javascript
  Scenario: Show default profile image
    Given I login with user "carlos"
    When I visit "/#/dashboard/1"
    Then I should see default profile image


