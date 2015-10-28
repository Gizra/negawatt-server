<?php
/**
 * @file
 * negawatt_image.features.inc
 */

/**
 * Implements hook_ctools_plugin_api().
 */
function negawatt_image_ctools_plugin_api($module = NULL, $api = NULL) {
  if ($module == "strongarm" && $api == "strongarm") {
    return array("version" => "1");
  }
}

/**
 * Implements hook_image_default_styles().
 */
function negawatt_image_image_default_styles() {
  $styles = array();

  // Exported image style: thumbnail_rotate.
  $styles['thumbnail_rotate'] = array(
    'name' => 'thumbnail_rotate',
    'label' => 'Thumbnail+rotate',
    'effects' => array(
      1 => array(
        'label' => 'Scale',
        'help' => 'Scaling will maintain the aspect-ratio of the original image. If only a single dimension is specified, the other dimension will be calculated.',
        'effect callback' => 'image_scale_effect',
        'dimensions callback' => 'image_scale_dimensions',
        'form callback' => 'image_scale_form',
        'summary theme' => 'image_scale_summary',
        'module' => 'image',
        'name' => 'image_scale',
        'data' => array(
          'width' => 100,
          'height' => 100,
          'upscale' => 0,
        ),
        'weight' => 1,
      ),
      2 => array(
        'label' => 'Autorotate',
        'help' => 'Autorotate image based on EXIF orientation and reset that tag.',
        'effect callback' => 'imagecache_autorotate_effect',
        'dimensions callback' => 'imagecache_autorotate_dimensions',
        'form callback' => 'imagecache_autorotate_form',
        'summary theme' => 'imagecache_autorotate_summary',
        'module' => 'imagecache_autorotate',
        'name' => 'imagecache_autorotate',
        'data' => array(),
        'weight' => 2,
      ),
    ),
  );

  return $styles;
}