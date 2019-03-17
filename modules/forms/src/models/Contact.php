<?php

namespace modules\forms\models;

use modules\forms\contracts\Saveable;
use modules\forms\models\Form;

use Craft;
use craft\elements\Entry;
use craft\mail\Message;

class Contact extends Form implements Saveable
{
    const SECTION_ID = 15;
    const TYPE_ID = 34;

    private $contact = '';
    private $fromEmail = '';

    public $firstName;
    public $lastName;
    public $email;
    public $phone;
    public $company;
    public $budget;
    public $message;

    public function __construct()
    {
        $this->contact = Entry::find()->section('contact')->one();
        $this->fromEmail = Craft::$app->getSystemSettings()->getEmailSettings()->fromEmail;
    }

    public function rules()
    {
        return [
            [['firstName', 'lastName', 'email', 'phone'], 'required'],
            ['firstName', 'string'],
            ['lastName', 'string'],
            ['email', 'email'],
            ['phone', 'string'],
            ['company', 'string'],
            ['budget', 'string'],
            ['message', 'string'],
        ];
    }

    public function attributeLabels(): array
    {
        return [
            'firstName' => 'First Name',
            'lastName' => 'Last Name',
            'email' => 'Email Address',
            'phone' => 'Phone Number',
            'company' => 'Company Name',
            'budget' => 'Your Budget',
            'message' => 'Breifly describe your project.',
        ];
    }

    public function attributeTypes(): array
    {
        return [
            'firstName' => 'text',
            'lastName' => 'text',
            'email' => 'email',
            'phone' => 'tel',
            'company' => 'text',
            'budget' => 'select',
            'message' => 'textarea',
        ];
    }

    public function attributeOptions(): array
    {
        return [
            'budget' => [
                ['value' => '1000000', 'label' => '$1M'],
                ['value' => '2000000', 'label' => '$2M'],
                ['value' => '5000000', 'label' => '$5M'],
            ],
        ];
    }


    public function attributeSizes(): array
    {
        return [
            'firstName' => 'half',
            'lastName' => 'half',
            'email' => 'half',
            'phone' => 'half',
            'company' => 'full',
            'budget' => 'full',
            'message' => 'full',
        ];
    }

    public function saveCraftEntry(): bool
    {
        $entry = new Entry([
            'sectionId' => 7, // Form Submissions
            'typeId' => 7, // Contact
            'authorId' => 1,
            'enabled' => true,
        ]);

        $entry->setFieldValues([
            'formFirstName' => $this->firstName,
            'formLastName' => $this->lastName,
            'formEmail' => $this->email,
            'formPhoneNumber' => $this->phone,
            'formCompany' => $this->company,
            'formBudget' => $this->budget,
            'formMessage' => $this->message,
        ]);


        if (!Craft::$app->getElements()->saveElement($entry)) {
            $this->addModelErrors($entry);

            return false;
        }

        return true;
    }

    public function sendNotificationEmail(): bool
    {
        $to = $this->fromEmail;
        if ($this->contact !== null) {
            $to = array_map(function ($row) {
                return $row['emailAddress'];
            }, $this->contact->contactNotificationEmails);
        }
        $heading = sprintf('%s Form Submission', $this->formName());

        $message = new Message();
        $message->setFrom($this->fromEmail);
        $message->setTo($to);
        $message->setSubject($heading);
        $message->setHtmlBody($this->printAttributesSummaryTable($heading));

        return Craft::$app->getMailer()->send($message);
    }

    public function sendConfirmationEmail(): bool
    {
        if ($this->contact === null) {
            return false;
        }

        $message = new Message();
        $message->setFrom($this->fromEmail);
        $message->setTo($this->email);
        $message->setSubject($this->contact->contactEmailSubject);
        $message->setHtmlBody($this->contact->contactEmailMessage);

        return Craft::$app->getMailer()->send($message);
    }
}
