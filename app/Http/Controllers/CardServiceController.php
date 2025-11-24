<?php

namespace App\Http\Controllers;

use App\Http\Requests\CardServiceRequest;
use App\Models\CardService;
use Illuminate\Http\Request;

class CardServiceController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        if(!$request->has('card_id')) return abort(404);
        $services = CardService::where('card_id', $request->card_id)->get();
        return response()->json($services);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(CardServiceRequest $request)
    {
        $service = new CardService();
        $service->card_id = $request->card_id;
        $service->title = $request->title;
        $service->description = $request->description;
        $service->save();

        return response()->json($service);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Services  $services
     * @return \Illuminate\Http\Response
     */
    public function update(CardServiceRequest $request, CardService $service)
    {
        $service->title = $request->title;
        $service->description = $request->description;
        $service->save();

        return response()->json($service);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Services  $services
     * @return \Illuminate\Http\Response
     */
    public function destroy(CardService $service)
    {
        $service->delete();
        return response()->json(['message' => translate('Card service deleted')]);
    }
}
