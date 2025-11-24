<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ReceivedBulkUploadRequest extends Mailable
{
    use Queueable, SerializesModels;

    public $data;
    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($data)
    {
        $this->data = $data;
    }

    public function attachments()
    {

    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {   
        return $this->from('Support@'.env('APP_DOMAIN','weshare.site'), env('APP_NAME', 'WeShare.Site'))
            ->replyTo($this->data['email'], $this->data['name'])
            ->subject(translate('Bulk Upload Request'))
            ->view('emails.receivedBulkUploadRequest');
    }
}
