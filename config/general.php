<?php
/**
 * General Configuration
 *
 * All of your system's general configuration settings go in here. You can see a
 * list of the available settings in vendor/craftcms/cms/src/config/GeneralConfig.php.
 *
 * @see craft\config\GeneralConfig
 */

return [
    // Global settings
    '*' => [
        // Default admin settings
        'allowAdminChanges' => false,
        'allowUpdates' => false,

        // https://craftcms.com/support/dev-mode
        'devMode' => false,

        // Default Week Start Day (0 = Sunday, 1 = Monday...)
        'defaultWeekStartDay' => 0,

        // Enable CSRF Protection (recommended)
        'enableCsrfProtection' => true,

        // Whether generated URLs should omit "index.php"
        'omitScriptNameInUrls' => true,

        // Control Panel trigger word
        'cpTrigger' => 'admin',

        // The secure key Craft will use for hashing and encrypting data
        'securityKey' => getenv('SECURITY_KEY'),

        // Base site URL
        'siteUrl' => getenv('SITE_URL'),

        // Create aliases that can be used to start, for example, an asset volume's path
        'aliases' => [
            '@assetBasePath' => getenv('HOME_PATH') . '/' . getenv('WEB_DIR') . '/' . getenv('ASSETS_DIR'),
            '@assetBaseUrl' => getenv('SITE_URL') . '/' . getenv('ASSETS_DIR'),
        ],

        'useEmailAsUsername' => true,

        // Set passwords during email verification flow
        'deferPublicRegistrationPassword' => true,

        // Authentication
        'loginPath' => 'login/index',
        'logoutPath' => 'logout',
        'setPasswordPath' => 'login/set',
        'autoLoginAfterAccountActivation' => true,

        // Paginate w/ query param instead of path
        'pageTrigger' => '?page',

        // Session config
        'rememberedUserSessionDuration' => 'P3M',
        'verificationCodeDuration' => 'P3M',

        // Project config
        'useProjectConfigFile' => true,

        'allowIpAddresses' => [
            '165.166.77.130',
        ],
    ],

    // Dev environment settings
    'dev' => [
        'allowAdminChanges' => true,
        'allowUpdates' => true,
        'devMode' => true,
        'userSessionDuration' => false,
        'allowIpAddresses' => [
            '::1',
            '127.0.0.1',
        ],
    ],

    // Staging environment settings
    'staging' => [],

    // Production environment settings
    'production' => [],
];
