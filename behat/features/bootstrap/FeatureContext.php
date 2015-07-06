<?php

use Drupal\DrupalExtension\Context\DrupalContext;
use Behat\Behat\Context\SnippetAcceptingContext;
use Behat\Gherkin\Node\PyStringNode;
use Behat\Gherkin\Node\TableNode;
use Behat\Behat\Tester\Exception\PendingException;

class FeatureContext extends DrupalContext implements SnippetAcceptingContext {

  /**
   * @When /^I login with user "([^"]*)"$/
   */
  public function iLoginWithUser($name) {
    // @todo: Move password to YAML.
    $password = '1234';
    $this->loginUser($name, $password);
  }

  /**
   * Login a user to the site.
   *
   * @param $name
   *   The user name.
   * @param $password
   *   The use password.
   * @param bool $check_success
   *   Determines if we should check for the login to be successful.
   *
   * @throws \Exception
   */
  protected function loginUser($name, $password, $check_success = TRUE) {
    $this->getSession()->visit($this->locatePath('/#/logout'));
    // Reload to force refresh button of the browser. (ui-router reload the state.)
    $this->getSession()->reload();
    $this->iWaitForCssElement('#login-form', 'appear');
    $element = $this->getSession()->getPage();
    $element->fillField('username', $name);
    $element->fillField('password', $password);
    $submit = $element->findButton('התחבר');

    if (empty($submit)) {
      throw new \Exception(sprintf("No submit button at %s", $this->getSession()->getCurrentUrl()));
    }

    // Log in.
    $submit->click();

    if ($check_success) {
      // Wait for the dashboard's menu to load, with the user accout information.
      $this->iWaitForCssElement('#dashboard-controls > ui-view > div > div.menu-account', 'appear');
    }
  }

  /**
   * @When /^I login with bad credentials$/
   */
  public function iLoginWithBadCredentials() {
    return $this->loginUser('wrong-foo', 'wrong-bar', FALSE);
  }

  /**
   * @Then /^I should wait for the text "([^"]*)" to "([^"]*)"$/
   */
  public function iShouldWaitForTheTextTo($text, $appear) {
    $this->waitForXpathNode(".//*[contains(normalize-space(string(text())), \"$text\")]", $appear == 'appear');
  }

  /**
   * @Then /^I wait for css element "([^"]*)" to "([^"]*)"$/
   */
  public function iWaitForCssElement($element, $appear) {
    $xpath = $this->getSession()->getSelectorsHandler()->selectorToXpath('css', $element);
    $this->waitForXpathNode($xpath, $appear == 'appear');
  }

  /**
   * @Then I should see the login page
   */
  public function iShouldSeeTheLoginPage() {
    $this->iWaitForCssElement('#login-form', 'appear');
  }

  /**
   * @Then I should see a category active
   */
  public function iShouldSeeCategoryActive() {
    $this->iWaitForCssElement('.active-category', 'appear');
  }

  /**
   * @Then I should see all categories inactive
   */
  public function iShouldSeeAllCategoriesInactive() {
    $this->iWaitForCssElement('.active-category', 'disappear');
  }

  /**
   * @Then I should see an alert :alert
   */
  public function iShouldSeeAnAlert($alert)  {
    $xpath = '//span[contains(., "' . $alert . '")]';
    $this->waitForXpathNode($xpath);
  }

  /**
   * @Then I should see :markers markers with class :css_class
   */
  public function iShouldSeeMarkersWithClass($markers, $css_class) {
    $xpath = '//div[@class="leaflet-marker-pane"]//img[contains(@class, "' . $css_class . '")]';
    $this->waitToCountXpathNodes($xpath, $markers);
  }

  /**
   * @Then I should see :markers markers
   */
  public function iShouldSeeMarkers($markers, $equals = TRUE) {
    $this->waitFor(function($context) use ($markers, $equals) {
      try {
        $nodes = $context->getSession()->evaluateScript('angular.element(".leaflet-marker-icon").length');
        if ($nodes == (int)$markers) {
          return $equals;
        }
        return !$equals;
      }
      catch (WebDriver\Exception $e) {
        if ($e->getCode() == WebDriver\Exception::NO_SUCH_ELEMENT) {
          return !$equals;
        }
        throw $e;
      }
    });
  }

  /**
   * @Then I should see a marker selected
   */
  public function iShouldSeeAMarkerSelected() {
    $selected_src_image = '-red.png';

    // check if exist and is selected.
    $this->waitFor(function($context) use ($selected_src_image) {
      try {
        // Get an array of string <img src="...">, filled with the value of the src attribute of the marker icon image and check id selected (if have ) '-red.png'.
        $marker_selected = $context->getSession()->evaluateScript('angular.element(".leaflet-marker-icon").map(function(index, element){ return angular.element(element).attr("src").indexOf("' . $selected_src_image . '") }).toArray();');
        // Reduce the array to empty or the position of the selected marker.
        $result = (!empty($marker_selected)) ? max($marker_selected): 0;

        if ($result > 0) {
          return TRUE;
        }
        return FALSE;
      }
      catch (WebDriver\Exception $e) {
        if ($e->getCode() == WebDriver\Exception::NO_SUCH_ELEMENT) {
          return FALSE;
        }
        throw $e;
      }
    });
  }

  /**
   * @Then I should have :frequency as chart usage label
   */
  public function iShouldHaveAsChartUsageLabel($frequency) {
    $csspath = '#chart-usage > div > div:nth-child(1) > div > svg > g:nth-child(5) > g:nth-child(1) > text';
    $this->waitForTextNgElement($csspath, $frequency);
  }

  /**
   * @Then I should not see the filters
   */
  public function iShouldNotSeeTheFilters() {
    $csspath = "input.hide-meters-category";
    $this->iWaitForCssElement($csspath, FALSE);
  }

  /**
   * @Then /^I should print page of "([^"]*)"$/
   */
  public function iShouldPrintPageOf($xpath) {
    print_r($this->getSession()->getPage()->find('xpath', $xpath)->getHtml());
  }

  /**
   * @Then I should see a chart from :initial KW to :final KW average power
   */
  public function iShouldSeeAChartFromKwToKwAveragePower($initial, $final) {
    $this->checkUsageChart($initial, $final);
  }


  /**
   * @Then I should see the previous monthly kws chart of all meters
   */
  public function iShouldSeeThePreviousMonthlyKwsChartOfAllMeters() {
    $start_chart = '#chart-usage > div > div:nth-child(1) > div > div > table > tbody > tr:nth-child(1) > td:nth-child(2)';
    $end_chart = '#chart-usage > div > div:nth-child(1) > div > div > table > tbody > tr:nth-child(20) > td:nth-child(2)';
    $this->waitForTextNgElement($start_chart, '7836');
    $this->waitForTextNgElement($end_chart, '256');
  }

  /**
   * @Then I should see category :category with :total_kws Kws
   */
  public function iShouldSeeCategoryWithKws($category, $total_kws) {
    $this->checkValuesPieChart($category, $total_kws);
  }

  /**
   * @Then I should see the contract :contract with :total_kws Kws
   */
  public function iShouldSeeTheContractWithKws($contract, $total_kws) {
    $this->checkValuesPieChart($contract, $total_kws);
  }

  /**
   * @When I should see the category :category
   */
  public function iShouldSeeTheCategory($category) {
    $xpath_category = '//ol//span[contains(., "' . $category . '")]';
    $this->waitForXpathNode($xpath_category);
  }

  /**
   * @Then I should see the monthly kws chart of a meter
   */
  public function iShouldSeeTheMonthlyKwsChartAMeter() {
    // Testing the height of the first and last column, with the default chart size and data of the migration.
    $start_chart = '#chart-usage > div > div:nth-child(1) > div > div > table > tbody > tr:nth-child(1) > td:nth-child(2)';
    $end_chart = '#chart-usage > div > div:nth-child(1) > div > div > table > tbody > tr:nth-child(12) > td:nth-child(2)';
    $this->waitForTextNgElement($start_chart, '10936');
    $this->waitForTextNgElement($end_chart, '3606');
  }

  /**
   * @When I click meter :meter
   */
  public function iClickMeter($meter) {
    try
    {
      //Wait for Angular
      if($this->getSession()->evaluateScript("return (typeof angular != 'undefined')"))
      {
        $angular = 'angular.getTestability(document.body).whenStable(function() {
                    window.__testable = true;
                })';
        $this->getSession()->evaluateScript($angular);
        $this->getSession()->wait(5000, 'window.__testable == true');
        // Update with the script to click on a meter
        $script = '(function clickMeter(id) {
            var $injector = angular.element("body").injector();
            var leafletData = $injector.get("leafletData");
            var Utils = $injector.get("Utils");
            var $filter = $injector.get("$filter");
            var scopeMeters = angular.element(".angular-leaflet-map").scope().meters;

            leafletData.getMarkers().then(function(meters) {
              angular.forEach(meters, function(meter, index) {
                meter.options.idLeaflet = index;
              });

              this.meterData = ($filter("filter")(Utils.toArray(meters), {options: {idLeaflet: id}})).pop();

              scopeMeters[this.meterData.options.id].select();
            }.bind(this));

          })(' . $meter . ')';
        $this->getSession()->evaluateScript($script);
      }

      //Wait for jQuery
      if($this->getSession()->evaluateScript("return (typeof jQuery != 'undefined')"))
      {
        $this->getSession()->wait(5000, '(0 === jQuery.active && 0 === jQuery(\':animated\').length)');
      }

    }catch(Exception $e)
    {

    }

  }

  /**
   * @Then I see a marker :meter not selected
   */
  public function iSeeAMarkerNotSelected($meter) {
    $this->iSeeAMarkerSelected($meter, FALSE);
  }


  /**
   * @Then I see a marker :meter selected
   */
  public function iSeeAMarkerSelected($meter, $is_selected = TRUE) {
    $selected_src_image = ($is_selected) ? '-red.png' : '-blue.png';

    $this->waitFor(function($context) use ($meter, $selected_src_image) {
      try {

        // Script to get the hmtl icon image.
        $script = '(function getMeterImgSrc(id) {
            var $injector = angular.element("body").injector();
            var leafletData = $injector.get("leafletData");
            var Utils = $injector.get("Utils");
            var $filter = $injector.get("$filter");
            var $rootScope = $injector.get("$rootScope");

            leafletData.getMarkers().then(function(meters) {
              angular.forEach(meters, function(meter, index) {
                meter.options.idLeaflet = index;
              });

              this.meterData = ($filter("filter")(Utils.toArray(meters), {options: {idLeaflet: id}})).pop();

            }.bind(this));

            $rootScope.$apply();
            return angular.element(this.meterData._icon).attr("src").indexOf("' . $selected_src_image . '");

          })(' . $meter . ')';

        $result = $context->getSession()->evaluateScript($script);

        if ($result > 0) {
          return TRUE;
        }
        return FALSE;
      }
      catch (WebDriver\Exception $e) {
        if ($e->getCode() == WebDriver\Exception::NO_SUCH_ELEMENT) {
          return FALSE;
        }
        throw $e;
      }
    });
  }

  /**
   * @When I press the :name button on the charts
   */
  public function iPressTheButtonOnTheCharts($name) {
    if ($name === 'previous') {
      $this->iWaitForCssElement('#chart-usage-btn-arrow-left', 'appear');
      $this->getSession()->getPage()->pressButton('chart-usage-btn-arrow-left');
    }
    else if ($name === 'next') {
      $this->iWaitForCssElement('#chart-usage-btn-arrow-right', 'appear');
      $this->getSession()->getPage()->pressButton('chart-usage-btn-arrow-right');
    }
  }

  /**
   * @When I reload :url
   */
  public function iReload($url) {
    $this->getSession()->visit($this->locatePath($url));
    // Reload to force refresh button of the browser. "ui-router reload the state."
    $this->getSession()->reload();
  }

  /**
   * @Then I should see the monthly kws chart for multiple markers
   */
  public function iShouldSeeTheMonthlyKwsChartForMultipleMarkers() {
    // Testing the height of the first and last column, with the default chart size and data of the migration.
    $start_chart_meter1 = '#chart-usage > div > div:nth-child(1) > div > div > table > tbody > tr:nth-child(1) > td:nth-child(2)';
    $end_chart_meter1 = '#chart-usage > div > div:nth-child(1) > div > div > table > tbody > tr:nth-child(9) > td:nth-child(2)';
    $start_chart_meter2 = '#chart-usage > div > div:nth-child(1) > div > div > table > tbody > tr:nth-child(1) > td:nth-child(3)';
    $end_chart_meter2 = '#chart-usage > div > div:nth-child(1) > div > div > table > tbody > tr:nth-child(9) > td:nth-child(3)';
    // Meter 1.
    $this->waitForTextNgElement($start_chart_meter1, '7836');
    $this->waitForTextNgElement($end_chart_meter1, '827');
    // Meter 2.
    $this->waitForTextNgElement($start_chart_meter2, '3081');
    $this->waitForTextNgElement($end_chart_meter2, '3606');
  }

  /**
   * @Then I should see a greeting as :greeting
   */
  public function iShouldSeeAsUsername($greeting) {
    $css_path_greeting = '#dashboard-controls > ui-view > div > div.menu-account > span';
    $this->waitForTextNgElement($css_path_greeting, $greeting);
  }

  /**
   * @Then I should see logo account
   */
  public function iShouldSeeLogoAccount() {
    $csspath = '#dashboard-controls > ui-view > div.menu-logo.ng-scope > img';
    $logo_filename = 'logo.png';
    $attr = 'src';
    $this->waitForAttrNgElement($csspath, $attr, $logo_filename);
  }

  /**
   * @Then I should see default profile image
   */
  public function iShouldSeeDefaultProfileImage() {
    $csspath = '#dashboard-controls > ui-view > div > div.menu-account.ng-scope > img.menu-account-photo';
    $img_filename = 'default_profile_white.png';
    $attr = 'src';
    $this->waitForAttrNgElement($csspath, $attr, $img_filename);
  }

  /**
   * @Then I should see today date
   */
  public function iShouldSeeTodayDate() {
    $csspath = '.menu-timedate-date';
    // Get today date direct from momentjs object in tha same format.
    $today = $this->getSession()->evaluateScript("moment().locale('he').format('YYYY MMMM DD');");

    $this->waitForTextNgElement($csspath, $today);
  }

  /**
   * @Then I should see :message in the chart of kws usage
   */
  public function iShouldSeeInTheChartOfKwsUsage($message) {
    $csspath = '#dashboard-controls > div > ui-view.dashboard-controls.dashboard-controls-row.dashboard-usage.ng-scope > div.row.chart-empty.ng-scope > div';
    $this->waitForTextNgElement($csspath, $message);
  }


  /**
   * @AfterStep
   *
   * Take a screen shot after failed steps for Selenium drivers (e.g.
   * PhantomJs).
   */
  public function takeScreenshotAfterFailedStep($event) {
    if ($event->getTestResult()->isPassed()) {
      // Not a failed step.
      return;
    }

    if ($this->getSession()->getDriver() instanceof \Behat\Mink\Driver\Selenium2Driver) {
      $file_name = sys_get_temp_dir() . DIRECTORY_SEPARATOR . time() . 'behat-failed-step.png';
      $screenshot = $this->getSession()->getDriver()->getScreenshot();
      file_put_contents($file_name, $screenshot);
      print "Screenshot for failed step created in $file_name";
    }
  }

  /**
   * @BeforeScenario
   *
   * Delete the RESTful tokens before every scenario, so user starts as
   * anonymous.
   */
  public function deleteRestfulTokens($event) {
    if (!module_exists('restful_token_auth')) {
      // Module is disabled.
      return;
    }
    if (!$entities = entity_load('restful_token_auth')) {
      // No tokens found.
      return;
    }
    // Delete from database.
    foreach ($entities as $entity) {
      $entity->delete();
    }
  }

  /**
   * @BeforeScenario
   *
   * Resize the view port.
   */
  public function resizeWindow() {
    if ($this->getSession()->getDriver() instanceof \Behat\Mink\Driver\Selenium2Driver) {
      $this->getSession()->resizeWindow(1440, 900, 'current');
    }
  }

  /**
   * Helper function; Execute a function until it return TRUE or timeouts.
   *
   * @param $fn
   *   A callable to invoke.
   * @param int $timeout
   *   The timeout period. Defaults to 30 seconds.
   *
   * @throws Exception
   */
  private function waitFor($fn, $timeout = 30000) {
    if (empty($timeout)) {
      $timeout = 30000;
    }

    $start = microtime(true);
    $end = $start + $timeout / 1000.0;
    while (microtime(true) < $end) {
      if ($fn($this)) {
        return;
      }
    }
    throw new \Exception('waitFor timed out.');
  }

  /**
   * Wait for an element by its XPath to appear or disappear.
   *
   * @param string $xpath
   *   The XPath string.
   * @param bool $appear
   *   Determine if element should appear. Defaults to TRUE.
   *
   * @throws Exception
   */
  private function waitForXpathNode($xpath, $appear = TRUE, $only_check_node_existence = FALSE) {
    $this->waitFor(function($context) use ($xpath, $appear, $only_check_node_existence) {
      try {
        $nodes = $context->getSession()->getDriver()->find($xpath);
        if (count($nodes) > 0) {
          if ($only_check_node_existence) {
            return TRUE;
          }
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
   * Wait to count a number of elements by its XPath.
   *
   * @param string $xpath
   *   The XPath string.
   * @param number $nodes_expected
   *   Number of nodes expected.
   *
   * @throws Exception
   */
  private function waitToCountXpathNodes($xpath, $nodes_expected) {
    $this->waitFor(function($context) use ($xpath, $nodes_expected) {
      try {
        $nodes = $context->getSession()->getDriver()->find($xpath);
        if (count($nodes) > 0 && count($nodes) == (int)$nodes_expected) {
          return TRUE;
        }
        return FALSE;
      }
      catch (WebDriver\Exception $e) {
        if ($e->getCode() == WebDriver\Exception::NO_SUCH_ELEMENT) {
          return FALSE;
        }
        throw $e;
      }
    });
  }

  /**
   * Wait for appear or disappear text of an element, the search is done with CSSPath.
   *
   * @param string $csspath
   *   The CSSPath string.
   * @param bool $appear
   *   Determine if element should appear. Defaults to TRUE.
   *
   * @throws Exception
   */
  private function waitForTextNgElement($csspath, $text, $timeout = NULL) {
    $this->waitFor(function($context) use ($csspath, $text) {
      try {
        $element_text = $context->getSession()->evaluateScript('angular.element("' . $csspath . '").text();');
        if ($element_text !== NULL && $element_text == $text) {
          return TRUE;
        }
        return FALSE;
      }
      catch (WebDriver\Exception $e) {
        if ($e->getCode() == WebDriver\Exception::NO_SUCH_ELEMENT) {
          return FALSE;
        }
        throw $e;
      }
    }, $timeout);
  }

  /**
   * Wait for appear or disappear an element. The search is done with CSSPath and angular.element.
   *
   * @param string $csspath
   *   The CSSPath string.
   * @param bool $appear
   *   Determine if element should appear. Defaults to TRUE.
   *
   * @throws Exception
   */
  private function waitForNgNodes($csspath, $appear = TRUE) {
    $this->waitFor(function($context) use ($csspath, $appear) {
      try {
        $nodes = $context->getSession()->evaluateScript('angular.element("' . $csspath . '");');
        if (count($nodes) > 0) {
          return $appear;
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
   * Wait for appear or disappear an attribute of an element, and check the value. The search is done with CSSPath and angular.element.
   *
   * @param string $csspath
   *   The CSSPath string.
   * @param string $value
   *   The CSSPath string.
   *
   * @throws Exception
   */
  private function waitForAttrNgElement($csspath, $attr, $value) {
    $this->waitFor(function($context) use ($csspath, $attr, $value) {
      try {
        $element_attribute = $context->getSession()->evaluateScript('angular.element("' . $csspath . '").attr("' . $attr . '");');
        if (strripos($element_attribute, $value) !== false) {
          return TRUE;
        }
        return FALSE;
      }
      catch (WebDriver\Exception $e) {
        if ($e->getCode() == WebDriver\Exception::NO_SUCH_ELEMENT) {
          return FALSE;
        }
        throw $e;
      }
    });
  }

  /**
   * Validate the toolptip data of the pie chart, label and value.
   *
   * @param $element
   *  The label, could be a category or a contract number.
   * @param $total_kws
   *  The value is a total electricity kws consumption.
   */
  private function checkValuesPieChart($element, $total_kws) {
    $validations = array(
      '//div[@id="dashboard-controls"]//td[.="' . $element . '"]',
      '//div[@id="dashboard-controls"]//td[.="' . $total_kws . '"]',
    );

    $this->checkValidations($validations, TRUE, TRUE);
  }

  /**
   * Validate the value of the initial and last colunms (from left to rigth).
   *
   * @param $initial
   *  The number of kws average power of the first column.
   * @param $final
   *  The number of kws average power of the last column.
   */
  private function checkUsageChart($initial, $final) {
    $validations = array(
      '//div[@id="chart-usage"]//td[contains(., "' . $initial . '")]',
      '//div[@id="chart-usage"]//td[contains(., "' . $final . '")]',
    );

    $this->checkValidations($validations, TRUE, TRUE);
  }


  /**
   * Get an array of xpath to validate if exist.
   *
   * @param $validations
   *  The array of xpath.
   * @param $appear
   *  Check if element appear in the view. is a boolean.
   * @param $only_check_node_existence
   *  Skeip the appear parameter and check only is defined in the DOM. is a boolean.
   */
  private function checkValidations($validations, $appear = TRUE, $only_check_node_existence = FALSE) {
    foreach($validations as $validation) {
      $this->waitForXpathNode($validation, $appear, $only_check_node_existence);
    }
  }

}
