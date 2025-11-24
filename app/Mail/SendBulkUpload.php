<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Exports\BulkTemplateExport;
use Excel;

class SendBulkUpload extends Mailable
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
        $filename = 'Bulk Upload - Tabellenblatt1.xlsx';

        return $this->from('Support@'.env('APP_DOMAIN','weshare.site'), env('APP_NAME', 'WeShare.Site'))
            ->replyTo('Support@'.env('APP_DOMAIN','weshare.site'), env('APP_NAME', 'WeShare.Site'))
            ->subject(env('APP_NAME', 'WeShare.Site').' '.translate('Bulk Upload'))
            ->attach(Excel::download(new BulkTemplateExport([]), $filename)->getFile(), ['as' => $filename])
            ->view('emails.sendBulkUpload');
    }
}
