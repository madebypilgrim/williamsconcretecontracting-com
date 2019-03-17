<?php

namespace modules\forms\controllers;

use modules\forms\FormsModule;
use modules\forms\contracts\Saveable;

use Craft;
use craft\web\Controller;

class FormsController extends Controller
{
    const HONEYPOT_HANDLE = 'wazzup';

    protected $allowAnonymous = ['submit'];

    public function actionSubmit()
    {
        $this->requirePostRequest();
        $request = Craft::$app->getRequest();
        $params = $request->getBodyParams();

        // Validate hashed variables
        $handle = Craft::$app->getSecurity()->validateData($params['handle']);

        if ($handle === false) {
            $message = 'Submission Error! Form data was tampered with.';

            if ($request->isAjax) {
                exit(json_encode([
                    'success' => $success,
                    'message' => $message,
                ]));
            }

            Craft::$app->getSession()->setError($message);
            Craft::$app->getUrlManager()->setRouteParams([
                'success' => $success,
                'message' => $message,
            ]);

            return;
        }

        $model = $this->getForm($handle);
        $model->setAttributes($params, false);

        // Check honeypot
        if (!empty($params[self::HONEYPOT_HANDLE])) {
            exit('Nice try robots');
        }

        // Validate
        if(!$model->validate()) {
            $success = false;
            $message = 'Submission Error! Please see form errors below.';

            if ($request->isAjax) {
                exit(json_encode([
                    'success' => $success,
                    'message' => $message,
                    'errors' => $model->getErrors(),
                ]));
            }

            // Send the global set back to the template
            Craft::$app->getSession()->setError($message);
            Craft::$app->getUrlManager()->setRouteParams([
                'success' => $success,
                'message' => $message,
                'model' => $model,
            ]);

            return;
        }

        // Save entry
        if(!$model->saveCraftEntry()) {
            error_log(sprintf('Failed to save craft entry for form: %s', $handle));
        }

        // Send notification
        if(!$model->sendNotificationEmail()) {
            error_log(sprintf('Failed to send notification email for form: %s', $handle));
        }

        // Send confirmation
        if(!$model->sendConfirmationEmail()) {
            error_log(sprintf('Failed to send confirmation email for form: %s', $handle));
        }

        // All is well
        $success = true;

        if ($request->isAjax) {
            exit(json_encode([
                'success' => $success,
            ]));
        }

        // Send the global set back to the template
        Craft::$app->getUrlManager()->setRouteParams([
            'success' => $success,
        ]);
    }

    /**
     * Use private wrapper function to ensure form returned from
     * service implements Saveable interface methods
     */
    private function getForm(string $handle): Saveable
    {
        return FormsModule::$forms->getForm($handle);
    }
}
