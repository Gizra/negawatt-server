<?php

/**
 * Jun 3, 2012
 * @file auction.controller.inc
 * @author blazey http://drupal.org/user/353861
 */

class ElectricityEntityController extends EntityAPIController {

  /**
   * Delete auction bids.
   *
   * @param $auction
   *   The auction of the bids being deleted.
   * @param $bid_ids
   *   Array of bid IDs.
   *
   * @return
   *   Whether the delete was successful.
   */
  public function deleteRaw($raw_ids) {
    // Delete the bids.
    if (!db_delete('negawatt_electricity_raw')->condition('id', $raw_ids, 'IN')->execute()) {
      return FALSE;
    }

    return TRUE;
  }
}
