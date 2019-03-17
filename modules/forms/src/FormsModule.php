<?php

namespace modules\forms;

use modules\forms\services\Forms;
use modules\forms\web\twig\variables\FormsVariable;

use craft\web\twig\variables\CraftVariable;

use yii\base\Event;
use yii\base\Module;

class FormsModule extends Module
{
    /**
     * @var Forms
     */
    public static $forms;

    /**
     * @inheritdoc
     */
    public function init()
    {
        parent::init();

        $this->setComponents([
            'forms' => Forms::class
        ]);
        self::$forms = $this->get('forms');

        // Set web variable for front end templates
        Event::on(CraftVariable::class, CraftVariable::EVENT_INIT, function(Event $event) {
            /** @var CraftVariable $variable */
            $variable = $event->sender;

            // Attach a class:
            $variable->set('forms', FormsVariable::class);
        });
    }
}
