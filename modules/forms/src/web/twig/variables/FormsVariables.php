<?php

namespace modules\forms\web\twig\variables;

use modules\forms\FormsModule;
use modules\forms\models\Form;

class FormsVariable
{
    public function getForm(string $handle): Form
    {
        return FormsModule::$forms->getForm($handle);
    }
}
