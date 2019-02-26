<?php
/**
 * Asset Volumes Configuration
 *
 * @see https://docs.craftcms.com/v3/config/#overriding-volume-settings
 */
$assetsPath = getenv('HOME_PATH').getenv('WEB_PATH').getenv('ASSETS_PATH');
$assetsUrl = getenv('ASSETS_URL').getenv('ASSETS_PATH');

return [
  'projectImages' => [
    'path' => $assetsPath.'/images/project',
    'url' => $assetsUrl.'/images/project',
  ],
  'siteImages' => [
    'path' => $assetsPath.'/images/site',
    'url' => $assetsUrl.'/images/site',
  ],
];
