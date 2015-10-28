<?php

/**
 * @file
 * Drush integration for the Negawatt normalizer module.
 */

/**
 * Implements hook_drush_command().
 */
function negawatt_account_drush_command() {
  $items['create-terms'] = array(
    'description' => dt('Create taxonomy terms.'),
    'arguments' => array(
      'machine_name'  => dt('Machine name of the vocabulary.'),
    ),
  );

  return $items;
}

/**
 * Create taxonomy terms.
 */
function drush_negawatt_account_create_terms($vocab_machine_name) {
  //$vocab_machine_name = drush_get_option('machine_name', NULL);
  $vocabulary = taxonomy_vocabulary_machine_name_load($vocab_machine_name);
  if (!$vocabulary) {
    throw new Exception('Machine name not recognized');
  }
  $vid = $vocabulary->vid;

  // Prepare terms map.
  $terms_map = array();

  $terms_array = taxonomy_terms_array();
  foreach ($terms_array as $term_data) {
    // Prepare term object.
    $term = (object) array(
      'vid' => $vid,
      'name' => $term_data[1],
      'description' => $term_data[4]
    );
    // Set parent (if exists).
    if ($term_data[2]) {
      $term->parent = $terms_map[$term_data[2]];
    }
    else {
      $term->parent = 0;
    }

    // Create term.
    taxonomy_term_save($term);

    // Update fields.
    $wrapper = entity_metadata_wrapper('taxonomy_term', $term);
    $wrapper->field_icon_categories->set($term_data[5]);
    $wrapper->field_match_strings->set($term_data[6]);
    $wrapper->save();

    // Put new item in terms map.
    $terms_map[$term_data[1]] = $term->tid;

    drush_log(format_string('Created term: @term', array('@term' => $term_data[1])), 'ok');
  }
}

function taxonomy_terms_array() {
  return array(
    array('public_1199', 'מבנה ציבור', '', '', 'מבנים ציבוריים כגון משרדים', 'public_building'),
    array('office_1199', 'מבנה משרדים', 'מבנה ציבור', '', 'מבנה משרדים', 'public_building'),
    array('municipality_1199', 'משרדי העירייה', 'מבנה ציבור', '', 'משרדי העירייה', 'public_building', 'עירייה|משרד|עיריה|עיריית|אגף'),
    array('library_1199', 'ספריה', 'מבנה ציבור', '', 'ספריה', 'public_building', 'ספריה'),
    array('edu_1199', 'מבנה חינוך', '', '', 'מבנה חינוך', 'education'),
    array('kindergarten_1199', 'גן ילדים', 'מבנה חינוך', '', 'גני ילדים', 'education', 'גן|פעוטון'),
    array('school_1199', 'בית ספר', 'מבנה חינוך', '', 'בתי ספר', 'education', 'בית ספר|בית הספר|בי"ס|ביה"ס|ביהס|בה"ס'),
    array('pais_1199', 'אשכול פיס', 'מבנה חינוך', '', 'אשכול פיס', 'education', 'אשכול פיס|אשכולות פיס'),
    array('youth_1199', 'מרכז נוער', 'מבנה חינוך', '', 'מרכז נוער', 'education'),
    array('pedago_1199', 'מרכז פדגוגי', 'מבנה חינוך', '', 'מרכז פדגוגי', 'education', 'פדגוגי'),
    array('outdoor_1199', 'תאורת חוץ', '', '', 'תאורת חוץ', 'lighting'),
    array('street_1199', 'תאורת רחובות', 'תאורת חוץ', '', 'תאורת רחובות', 'lighting', 'תאורת|מאור|מרכזיה|מ.רחובות|פארק|תאורה|מרכזית'),
    array('traffic_1199', 'רמזור', 'תאורת חוץ', '', 'רמזור', 'traffic_light', 'רמזור'),
    array('security_1199', 'בטחון', '', '', 'בטחון', 'security'),
    array('shelter_1199', 'מקלט', 'בטחון', '', 'מקלט', 'security', 'מקלט'),
    array('storeroom_1199', 'מחסן חרום', 'בטחון', '', 'מחסן חרום', 'security', 'מחסן'),
    array('police_1199', 'שיטור קהילתי', 'בטחון', '', 'שיטור קהילתי', 'security', 'שיטור|משמר'),
    array('sport_1199', 'מתקן ספורט', '', '', 'מתקן ספורט', 'sports'),
    array('pool_1199', 'בריכת שחייה', 'מתקן ספורט', '', 'בריכת שחייה', 'sports', 'שחייה|שחיה'),
    array('field_1199', 'מגרש ספורט', 'מתקן ספורט', '', 'מגרש ספורט', 'sports', 'מגרש'),
    array('hall_1199', 'אולם ספורט', 'מתקן ספורט', '', 'אולם ספורט', 'sports', 'אולם'),
    array('religion_1199', 'שרותי דת', '', '', 'שרותי דת', 'religion'),
    array('prayer_1199', 'בית תפילה', 'שרותי דת', '', 'בית תפילה', 'religion'),
    array('synagogue_1199', 'בית כנסת', 'בית תפילה', '', 'בית כנסת', 'religion', 'כנסת'),
    array('church_1199', 'כנסיה', 'בית תפילה', '', 'כנסיה', 'religion', 'כנסיה'),
    array('mosque_1199', 'מסגד', 'בית תפילה', '', 'מסגד', 'religion', 'מסגד'),
    array('relcouncil_1199', 'מועצה דתית', 'שרותי דת', '', 'מועצה דתית', 'religion'),
    array('mikve_1199', 'מקווה', 'שרותי דת', '', 'מקווה', 'religion', 'מקווה'),
    array('health_1199', 'בריאות', '', '', 'בריאות', 'health'),
    array('mental_1199', 'בריאות הנפש', 'בריאות', '', 'בריאות הנפש', 'health'),
    array('paishealth_1199', 'פיס לבריאות', 'בריאות', '', 'פיס לבריאות', 'health', 'פיס לבריאות|פייס לבריאות'),
    array('water_1199', 'מתקן מים', '', '', 'מתקן מים', 'water', 'מתקן מים|חימצון|בריכת אגירה'),
    array('welfare_1199', 'רווחה', '', '', 'רווחה', 'welfare', 'רווחה'),
    array('apartment_1199', 'דירת רווחה', 'רווחה', '', 'דירת רווחה', 'welfare'),
    array('psyco_1199', 'השירות הפסיכולוגי', 'רווחה', '', 'השירות הפסיכולוגי', 'welfare', 'פסיכולוגי'),
    array('club_1199', 'מועדון', 'רווחה', '', 'מועדון', 'welfare', 'מועדון|מועדונית'),
    array('elderly_1199', 'מרכז יום לקשיש', 'רווחה', '', 'מרכז יום לקשיש', 'welfare', 'קשישים|לקשיש'),
    array('community_1199', 'מרכז קהילתי', 'רווחה', '', 'מרכז קהילתי', 'welfare'),
    array('culture_1199', 'תרבות', '', '', 'תרבות', 'culture'),
    array('other_1199', 'אחר', '', '', 'אחר', 'other  '),
);
}