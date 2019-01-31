<?php

namespace modules\utilities;

use modules\utilities\web\twig\variables\UtilitiesVariable;

use craft\web\twig\variables\CraftVariable;

use yii\base\Event;
use yii\base\Module;

class UtilitiesModule extends Module
{
    public function init()
    {
        parent::init();

        // Set web variable for front end templates
        Event::on(CraftVariable::class, CraftVariable::EVENT_INIT, function(Event $event) {
            /** @var CraftVariable $variable */
            $variable = $event->sender;

            // Attach a class:
            $variable->set('utilities', UtilitiesVariable::class);
        });
    }
}
