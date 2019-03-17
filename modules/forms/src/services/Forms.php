<?php

namespace modules\forms\services;

use modules\forms\models\Contact;
use modules\forms\models\Form;

use craft\base\Component;

class Forms extends Component
{

    public function getForm(string $handle): Form
    {
        $model = new Form();

        switch ($handle) {
        case 'contact':
            $model = new Contact();

            break;
        }

        return $model;
    }
}
