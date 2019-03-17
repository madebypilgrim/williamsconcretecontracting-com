<?php

namespace modules\forms\contracts;

interface Saveable
{
    public function saveCraftEntry(): bool;
    public function sendNotificationEmail(): bool;
    public function sendConfirmationEmail(): bool;
}
