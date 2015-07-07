<?php


/**
 * @file
 * Contains NegaWattAnalyzerInterface.
 */

interface NegaWattAnalyzerInterface {


  /**
   * Constructor for the NegaWattAnalyzerInterface.
   */
  public function __construct();

  /**
   * Analyze entities returned after processing.
   *
   * @param array $data
   *    Data to analyze. An array of the form: array[frequency][timestamp][rate-type] = entity
   * @param bool $create_message
   *    If true, warning messages will be created at the end
   *
   * @return array
   *    An array of message-parameters for warning report.
   */
  public function process(array $data, $create_message = TRUE);

  /**
   * The name of the analyzer module.
   *
   * @return string
   *    The name of the analyzer.
   */
  public function getName();
}
