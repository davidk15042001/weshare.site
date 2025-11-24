<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\CustomCodesRequest;
use App\Models\CardCustomCode;

class CustomCodesController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        if(!$request->has('card_id')) return abort(404);
        $codes = CardCustomCode::where('card_id', $request->card_id)->get();
        return response()->json($codes);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(CustomCodesRequest $request)
    { 
        $code = new CardCustomCode();
        $code->card_id = $request->card_id;
        $code->title = $request->title ?? '';
        $code->codes = $request->codes;
        $code->source = $request->source;
        $code->save();

        return response()->json($code);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(CustomCodesRequest $request, $id)
    {
        $code = CardCustomCode::find($id);
        $code->title = $request->title ?? '';
        $code->codes = $request->codes;
        $code->source = $request->source;
        $code->save();

        return response()->json($code);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $code = CardCustomCode::find($id);
        $code->delete();
        return response()->json(['message' => translate('Card service deleted')]);
    }
}
