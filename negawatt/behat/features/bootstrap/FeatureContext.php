<?php

use Drupal\DrupalExtension\Context\DrupalContext;
use Behat\Behat\Context\Step\Given;
use Behat\Gherkin\Node\TableNode;
use Guzzle\Service\Client;
use Behat\Behat\Context\Step;
use Behat\MinkExtension\Context\MinkContext;

require 'vendor/autoload.php';

class FeatureContext extends Drupal\DrupalExtension\Context\DrupalContext {

  /**
   * Initializes context.
   *
   * Every scenario gets its own context object.
   *
   * @param array $parameters.
   *   Context parameters (set them up through behat.yml or behat.local.yml).
   */
  public function __construct(array $parameters) {
    if (!empty($parameters['drupal_users'])) {
      $this->drupal_users = $parameters['drupal_users'];
    }
  }

  /**
   * @When /^I visit the front page$/
   */
  public function iVisitTheFrontPage() {
    $steps = array();

    $steps[] = new Step\When('I am at "/"');
    return $steps;
  }

  /**
   * @When /^I login with user "([^"]*)"$/
   */
  public function iLoginWithUser($name) {
    $password = $this->drupal_users[$name];

    $steps[] = new Step\When('I visit the front page');
    $steps[] = new Step\When('I fill in "username" with "' . $name .'"');
    $steps[] = new Step\When('I fill in "password" with "' . $password .'"');
    $steps[] = new Step\When('I follow "Log in"');
    $steps[] = new Step\When('I wait');

    return $steps;
  }

  /**
   * @Then /^the dashbaord should be visible$/
   */
  public function theDashbaordShouldBeVisible() {
    $steps = array();

    $steps[] = new Step\When('I should see the link "Dashboard"');
    return $steps;
  }

  /**
   * @Given /^I wait$/
   */
  public function iWait() {
    sleep(3);
  }

  /**
   * @Then /^I should print page$/
   */
  public function iShouldPrintPage() {
    print $this->getSession()->getPage()->getContent();
  }

  /**
   * @BeforeScenario
   *
   * Delete the tokens before every scenario.
   */
  public function before($event) {
    if (!$entities = entity_load('restful_token_auth')) {
      return;
    }

    foreach ($entities as $entity) {
      $entity->delete();
    }
  }
}
