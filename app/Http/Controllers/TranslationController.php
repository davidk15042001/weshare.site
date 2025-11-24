<?php

namespace App\Http\Controllers;

use App\Models\Translation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;

class TranslationController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $translations = Translation::whereRaw(1);
        if($request->has('search')){
            $translations->where('default', 'like', '%'.$request->search.'%');
        }
        $translations = $translations->orderBy('default')->get();
        $translations->each(function($row){
            $row->translated = json_decode($row->translation);
        });

        return Inertia::render('Translations', [
            'translations' => $translations
        ]); 
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        if($request->has('default') && !empty($request->default)){
            $translation = Translation::where('default', $request->default)->first();
            if(!$translation){
                $translation = new Translation();
                $translation->default = $request->default;
                $translation->save();
                Artisan::call('translation:generate');
                Artisan::call('config:clear');
            }
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Translation  $translation
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Translation $translation)
    {
        $translation->translation = $request->translation;
        $translation->update();

        $translation->translated = json_decode($translation->translation);
        Artisan::call('translation:generate');
        Artisan::call('config:clear');

        return response()->json($translation);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Translation  $translation
     * @return \Illuminate\Http\Response
     */
    public function destroy(Translation $translation)
    {
        //
    }
}
