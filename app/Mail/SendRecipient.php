<?php

namespace App\Mail;

use App\Models\CallBack;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SendRecipient extends Mailable
{
    use Queueable, SerializesModels;

    public $callback;
    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(CallBack $callback)
    {
        $this->callback = $callback;
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
            ->replyTo($this->callback->card->email, $this->callback->card->firstname.' '.$this->callback->card->lastname)
            ->subject($this->callback->card->firstname.' '.$this->callback->card->lastname.' '.translate('Contact Information'))
            ->attach($this->callback->file)
            ->view('emails.sendcontacts');
    }
}
