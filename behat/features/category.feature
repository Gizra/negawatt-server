Feature: Category
  In order to check markers filter by category
  As authenticated user
  We need to be able select a category and filter the markers.

  @javascript @wip
  Scenario: Show only meters of a selected category
    Given I login with user "carlos"
    When I visit '#/dashboard/category/13'
    Then I should see than a marker disappeared
