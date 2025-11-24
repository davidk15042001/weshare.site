<?php

namespace App\Http\Controllers;

use App\Http\Requests\CardDocumentRequest;
use App\Models\CardDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CardDocumentController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        if(!$request->has('card_id')) return abort(404);
        $services = CardDocument::where('card_id', $request->card_id)->get();
        return response()->json($services);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(CardDocumentRequest $request)
    {
        $path = $request->file('file')->store(
            'documents/'.$request->card_id, 'public'
        );
        $cardDocument = new CardDocument();
        $cardDocument->card_id = $request->card_id;
        $cardDocument->title = $request->title;
        $cardDocument->path = $path;
        $cardDocument->save();

        $filesize = filesize(public_path('storage/'.$path));
        $cardDocument->size = round($filesize / 1024, 2);

        return response()->json($cardDocument);
    }


    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\CardDocument  $cardDocument
     * @return \Illuminate\Http\Response
     */
    public function destroy(CardDocument $document)
    {
        unlink(public_path('storage/'.$document->path));
        $document->delete();
    }
}
