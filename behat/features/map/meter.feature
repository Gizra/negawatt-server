Feature: Meter
  In order to view the location of the meters
  As authenticated user
  We need to be able view the meters as markers on the map

  @javascript @wip
  Scenario: Show all meters of the account
    Given I login with user "carlos"
    When I visit "/#/dashboard/1"
    Then I should see "4" markers

  @javascript @wip
  Scenario: Show only meters of a selected
    Given I login with user "carlos"
    When I visit "/#/dashboard/1/marker/9"
    Then I should see a marker selected

  @javascript @wip
  Scenario: Show message of inexistent meter
    Given I login with user "carlos"
    When I visit "/#/dashboard/1/marker/9000"
    Then I should see an alert "מונה לא קיים."

  @javascript @wip
  Scenario: Show only meters of a selected in a category
    Given I login with user "carlos"
    When I visit "/#/dashboard/1/marker/9?categoryId=5"
    Then I should see a marker selected

  @javascript @wip
  Scenario: Show meters with not selected category semitransparent
    Given I login with user "carlos"
    When I visit "/#/dashboard/1/category/14"
    And I should see "4" markers
    And I should print page of "//div[contains(@class, 'leaflet-marker-pane')]"
    Then I should see "2" markers with class "leaflet-marker-icon-transparent"

  @javascript @wip
  Scenario: Show only meters not filter in the category menu.
    Given I login with user "carlos"
    When I visit "/#/dashboard/1"
    Then I should see "4" markers
    And I uncheck the box "מבנה חינוך"
    And the "מבנה חינוך" checkbox should not be checked
    And I should see "3" markers
    And I check the box "מבנה חינוך"
    And I uncheck the box "בטחון"
    And the "בטחון" checkbox should not be checked
    And I should see "2" markers

  @javascript @wip
  Scenario: Show meter selected when click it.
    Given I login with user "carlos"
    When I visit "/#/dashboard/1"
    And I click meter "9"
    Then I see a marker "9" selected

  @javascript @wip
  Scenario: Show meters when change the account by url.
    Given I login with user "carlos"
    When I visit "/#/dashboard/1"
    And I should see "4" markers
    Then I visit "/#/dashboard/2"
    And I should see "4" markers

  @javascript @wip
  Scenario: Show meter unselected when click on category, after his selection.
    Given I login with user "carlos"
    When I visit "/#/dashboard/1"
    And I click meter "9"
    And I see a marker "9" selected
    And I click "בטחון"
    Then I see a marker "9" not selected