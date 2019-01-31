<?php

namespace modules\utilities\web\twig\variables;

class UtilitiesVariable
{
    public function uniqueId()
    {
        return sprintf('_%s', uniqid());
    }
}
