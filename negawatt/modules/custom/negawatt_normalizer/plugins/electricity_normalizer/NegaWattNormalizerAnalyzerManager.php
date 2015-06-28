<?php

/**
 * @file
 * Contains NegaWattNormalizerAnalyzerManager.
 */

class NegaWattNormalizerAnalyzerManager extends \ArrayObject {

  /**
   * Adds an analyzer to the list.
   *
   * @param \NegaWattNormalizerAnalyzerInterface $analyzer
   *   The analyzer plugin object.
   */
  public function addAnalyzer(\NegaWattNormalizerAnalyzerInterface $analyzer) {
    $this->offsetSet($analyzer->getName(), $analyzer);
  }

  /**
   * Analyze a set of data entities.
   *
   * @param array $data
   *    Data to analyze. An array of the form: array[frequency][timestamp][rate-type] = entity
   * @param null $analyzer_name
   *    A name of a specific analyzer. If NULL, all the analyzer will
   *    be given a chance to process the data.
   * @param bool $create_messages
   *    If true, warning message will be created at the end.
   *
   * @return bool
   *    TRUE if everything was OK.
   *
   * @throws Exception
   *    If given analyzer name is not recognized.
   *
   */
  public function analyze(array $data, $analyzer_name = NULL, $create_messages = TRUE) {
    // Resolve the analyzer based on the providers in the manager.
    $warnings = array();
    if ($analyzer_name) {
      // Analyzer name was given, let it process the data.
      if (!$this->offsetExists($analyzer_name)) {
        throw new \Exception (format_string('Analyzer @name was not found.', array('@name' => $analyzer_name)));
      }
      $warnings = $this->offsetGet($analyzer_name)->process($data);

      // If requested, create warning messages.
      if ($create_messages) {
        $this->createMessages($warnings);
      }

    }
    else {
      // Analyzer name was not given. Loop over all analyzers and let those
      // who apply to process the data.
      foreach ($this as $analyzer) {
        if (!$analyzer->applies($data)) {
          // Analyzer doesn't apply to this set of data.
          continue;
        }
        // Analyzer applies, go ahead and process the data.
        $warnings = $analyzer->process($data);

        // If requested, create warning messages.
        if ($create_messages) {
          $this->createMessages($warnings);
        }
      }
    }
    return TRUE;
  }

  /**
   * Create warning messages from message-parameters given as values array
   *
   * @param $values
   *   Array of message parameters keyed by the analyzer name, with the
   *   following properties:
   *   - nid: Node id of the meter.
   *   - message_type: The messages id in drupal's message stack, e.g.
   *   'anomalous_consumption'.
   *   - arguments: Array of message arguments.
   */
  protected function createMessages($values) {
    foreach ($values as $value) {
      // Generate the message.
      // Get the node and user account.
      $node = node_load($value['nid']);
      $user_account = user_load($node->uid);

      // Get meter-account from meter-node
      $wrapper = entity_metadata_wrapper('node', $node);
      $meter_account = $wrapper->{OG_AUDIENCE_FIELD}->value();

      // Create message and set fields.
      $message = message_create($value['message_type'], array('arguments' => $value['arguments']), $user_account);
      $wrapper = entity_metadata_wrapper('message', $message);
      $wrapper->field_meter->set($node);
      $wrapper->field_meter_account->set($meter_account);
      $wrapper->field_message_place_description->set($value['description']);
      $wrapper->save();

      // Output message.
      $message = "** Notification issued: \n" . print_r($values, TRUE);
      if (drupal_is_cli()) {
        drush_log($message);
      }
      else {
        debug($message);
      }
    }
  }
}
