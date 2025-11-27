<?php

namespace App\Http\Controllers;

use App\Http\Requests\CallBackRequest;
use App\Mail\SendCallBack;
use App\Mail\SendRecipient;
use App\Models\CallBack;
use App\Models\Card;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use JeroenDesloovere\VCard\VCard;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use App\Service\VCardService;

class CallBackController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $cards = Card::where('user_id', $request->user()->id)->pluck('id')->toArray();
        $callbacks = CallBack::whereIn('card_id', $cards)->get();
        $callbacks->each(function($callback){
            $callback->time = $callback->created_at->diffForHumans();
        });
        return response()->json($callbacks);
    }

    public function contacts(Request $request)
    {
        $cards = Card::where('user_id', $request->user()->id)->pluck('id')->toArray();
        $contacts = CallBack::whereIn('card_id', $cards)->get();
        $contacts->each(function($contact) {
            $contact->datetime = date('d-m-Y H:i', strtotime($contact->created_at));
        });
        return Inertia::render('Contacts', ['contacts' => $contacts]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(CallBackRequest $request)
    {
        $callback = new CallBack();
        $callback->card_id = $request->card_id;
        $callback->name = $request->name;
        $callback->email = $request->email;
        $callback->phone = $request->phone ?? '';
        $callback->company = $request->company ?? '';
        $callback->reachability = $request->reachability ?? '';
        $callback->status = 'pending';
        $callback->save();
        $callback->load('card');

        $card = Card::find($request->card_id);

        $vcard = new VCardService($card);
        $content = $vcard->getOutput();

        $filename = $card->firstname.'-'.$card->lastname.'.vcf';
        Storage::disk('local')->put($filename, $content);
        $file = storage_path("app/".$filename);

        if(file_exists($file)){
            $callback->file = $file;
        }

        $callback->file = $file;
        $callback->download_url = env('APP_PROTOCOL', 'https').'://' . $card->identifier . '.' . env('APP_DOMAIN', 'vi-site.de').'/download';
        $callback->identifier = $card->identifier . '.' . env('APP_DOMAIN', 'vi-site.de');
        $callback->identifierURL = env('APP_PROTOCOL', 'https').'://' . $card->identifier . '.' . env('APP_DOMAIN', 'vi-site.de');

        if(!empty($callback->card->email)){
            Mail::to($callback->card->email)->send(new SendCallBack($callback));
            Mail::to($callback->email)->send(new SendRecipient($callback));
        }

        if(file_exists($file)){
            unlink($file);
        }

        return response()->json($callback);
    }

    public function update(CallBackRequest $request, $id)
    {
        $contact = CallBack::findOrFail($id);
        if($request->has('name')) $contact->name = $request->name;
        if($request->has('company')) $contact->company = $request->company;
        if($request->has('email')) $contact->email = $request->email;
        if($request->has('phone')) $contact->phone = $request->phone;
        if($request->has('notes')) $contact->notes = $request->notes;
        $contact->save();

        return response()->json($contact);
    }

    public function download(Request $request, $id)
    {
        $contact = CallBack::find($id);

        $vcard = new VCardService($contact);
        $content = $vcard->getOutput();

        $response = new Response();
        $response->setContent($content);
        $response->setStatusCode(200);
        $response->headers->set('Content-Type', 'text/x-vcard');
        $response->headers->set('Content-Disposition', 'attachment; filename="'.$contact->name.'.vcf"');
        $response->headers->set('Content-Length', mb_strlen($content, 'utf-8'));

        return $response;
    }

    public function export(Request $request)
    {
        $fileName = 'Contact Export.csv';
        $cards = Card::where('user_id', $request->user()->id)->pluck('id')->toArray();
        $contacts = CallBack::whereIn('card_id', $cards)->get();
        $contacts->each(function($contact) {
            $contact->datetime = date('d-m-Y H:i', strtotime($contact->created_at));
        });

        $headers = array(
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        );

        $columns = array('Name', 'Company', 'E-Mail', 'Phone', 'Date');

        $callback = function() use($contacts, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($contacts as $contact) {
                $row['name'] = $contact->name;
                $row['company'] = $contact->company;
                $row['email'] = $contact->email;
                $row['phone'] = $contact->phone;
                $row['date'] = $contact->datetime;

                fputcsv($file, array($row['name'], $row['company'], $row['email'], $row['phone'], $row['date']));
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function destroy(Request $request, $id)
    {
        $contact = CallBack::find($id);
        $contact->delete();
    }

}
