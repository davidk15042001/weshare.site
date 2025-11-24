<?php
namespace App\Service;

use JeroenDesloovere\VCard\VCard;

class VCardService {
    public $details;

    public function __construct($details) {
        $this->details = $details;
    }

    public function getOutput() {
        $vcard = new VCard();

        if(isset($this->details->name)) {
            $vcard->addName($this->details->name);
        } else {
            $vcard->addName($this->details->lastname, $this->details->firstname);
        }

        if(!empty($this->details->company)) $vcard->addCompany($this->details->company);
        if(!empty($this->details->job)) $vcard->addJobtitle($this->details->job);
        if(!empty($this->details->email)) $vcard->addEmail($this->details->email);
        if(!empty($this->details->phone)) $vcard->addPhoneNumber($this->details->phone, 'PREF;WORK');
        if(!empty($this->details->mobile)) $vcard->addPhoneNumber($this->details->mobile);
        if(!empty($this->details->address)) $vcard->addAddress($this->details->address);
        if(!empty($this->details->website)) $vcard->addURL($this->details->socials->website);

        return $vcard->getOutput();
    }
}
