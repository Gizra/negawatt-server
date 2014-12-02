<?php

use Drupal\DrupalExtension\Context\DrupalContext;
use Behat\Behat\Context\Step\Given;
use Behat\Gherkin\Node\TableNode;
use Behat\Behat\Exception\PendingException;
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

    $this->getSession()->resizeWindow(1440, 900, 'current');

    $steps[] = new Step\When('I visit the front page');
    $steps[] = new Step\When('I fill in "username" with "' . $name .'"');
    $steps[] = new Step\When('I fill in "password" with "' . $password .'"');
    $steps[] = new Step\When('I press "Log in"');

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
   * @When /^I click on marker$/
   */
  public function iClickOnMarker() {
    $page = $this->getSession()->getPage();
    $element = $page->find('xpath', '//*[@id="nav"]/li[2]/a/span');
    $element->click();
  }

  private function waitFor($fn, $timeout = 10000) {
    $start = microtime(true);
    $end = $start + $timeout / 1000.0;
    while (microtime(true) < $end) {
      if ($fn($this)) {
        return;
      }
    }
    throw new \Exception("waitFor timed out");
  }

  private function waitForXpathNode($xpath, $appear = TRUE) {
    $this->waitFor(function($context) use ($xpath, $appear) {
      try {
        $nodes = $context->getSession()->getDriver()->find($xpath);
        if (count($nodes) > 0) {
          $visible = $nodes[0]->isVisible();
          return $appear ? $visible : !$visible;
        }

        return !$appear;
      }
      catch (WebDriver\Exception $e) {
        if ($e->getCode() == WebDriver\Exception::NO_SUCH_ELEMENT) {
          return !$appear;
        }
        throw $e;
      }

    });
  }

  /**
   * @Given /^I wait for text "([^"]+)" to (appear|disappear)$/
   */
  public function iWaitForText($text, $appear) {
    $this->waitForXpathNode(".//*[contains(normalize-space(string(text())), \"$text\")]", $appear == 'appear');
  }

  /**
   * @Given /^I wait for css element "([^"]+)" to (appear|disappear)$/
   */
  public function iWaitForCssElement($element, $appear) {
    $xpath = $this->getSession()->getSelectorsHandler()->selectorToXpath('css', $element);
    $this->waitForXpathNode($xpath, $appear == 'appear');
  }

  private function waitForXpath($xpath, $appear) {
    $this->waitFor(function($context) use ($xpath, $appear) {
      $visible = $context->getSession()->getDriver()->isVisible($xpath);
      return $appear ? $visible : !$visible;
    });
  }


  /**
   * @Given /^I click on school category$/
   */
  public function iClickOnSchoolCategory() {
    $page = $this->getSession()->getPage();

    $this->waitForXpathNode('//*[@id="nav"]/li[2]/a/span');
    $element = $page->find('xpath', '//*[@id="nav"]/li[2]/a/span');
    $element->click();

    $this->waitForXpathNode('//*[@id="nav"]/li[2]/ul/li[1]/a/span');
    $element = $page->find('xpath', '//*[@id="nav"]/li[2]/ul/li[1]/a/span');
    $element->click();

    $this->iWaitForCssElement('.leaflet-marker-icon', 'appear');

    throw new Exception('test');
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

  /**
   * @AfterStep
   *
   * Take a screenshot after failed steps.
   */
  public function takeScreenshotAfterFailedStep($event) {
    if ($event->getResult() != 4) {
      // Step didn't fail.
      return;
    }
    if (!($this->getSession()->getDriver() instanceof \Behat\Mink\Driver\Selenium2Driver)) {
      // Not a Selenium driver (e.g. PhantomJs).
      return;
    }

    $file_name = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'behat-failed-step.png';
    $screenshot = $this->getSession()->getDriver()->getScreenshot();
    file_put_contents($file_name, $screenshot);
    print "Screenshot for failed step created in $file_name";
  }
}
