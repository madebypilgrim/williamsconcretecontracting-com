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
        // Default Week Start Day (0 = Sunday, 1 = Monday...)
        'defaultWeekStartDay' => 0,
        // Enable CSRF Protection (recommended)
        'enableCsrfProtection' => true,
        'useEmailAsUsername' => true,
        // Set passwords during email verification flow
        // 'deferPublicRegistrationPassword' => true,
        // 'loginPath' => 'login/index',
        // 'logoutPath' => 'logout',
        // 'setPasswordPath' => 'login/set',
        // Whether generated URLs should omit "index.php"
        'omitScriptNameInUrls' => true,
        // Control Panel trigger word
        'cpTrigger' => 'admin',
        'rememberedUserSessionDuration' => 'P3M',
        // The secure key Craft will use for hashing and encrypting data
        'securityKey' => getenv('SECURITY_KEY'),
        'verificationCodeDuration' => 'P3M',
        'useProjectConfigFile' => false,
    ],

    // Dev environment settings
    'dev' => [
        // Dev Mode (see https://craftcms.com/support/dev-mode)
        'devMode' => true,
        'siteUrl' => 'http://' . SITE_HANDLE . '.localhost',
        // 'siteUrl' => 'http://10.0.2.2', // For testing IE in VirtualBox
        'userSessionDuration' => false,
    ],

    // Staging environment settings
    'staging' => [
        // Prevent administrative changes from being made on staging
        'allowAdminChanges' => false,
        'siteUrl' => 'https://staging.' . SITE_HANDLE . '.com',
        'userSessionDuration' => false,
    ],

    // Production environment settings
    'production' => [
        // Prevent administrative changes from being made on staging
        'allowAdminChanges' => false,
        'siteUrl' => 'https://' . SITE_HANDLE . '.com',
    ],
];
