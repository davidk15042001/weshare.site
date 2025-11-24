<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PexelController extends Controller
{
    protected $API_KEY = 'JGMPthbK16qkFKFcQoFu6MYV2Qz9PXrbb7xW4woepy7gt9H3pbi03USf';
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    public function photos(Request $request)
    {
        $lang = !empty($_COOKIE['locale']) ?$_COOKIE['locale']: 'en';
        $lang = $lang === 'en' ? "$lang-us" : "$lang-de";

        $response = Http::withHeaders(['Authorization' => $this->API_KEY])
            ->acceptJson()
            ->get("https://api.pexels.com/v1/search/",[
                "query" => $request->keyword,
                "per_page" => (int)$request->per_page,
                "page" => $request->has('page') ? (int)$request->page : 1,
                "locale" => $lang
            ])
            ->throw()
            ->json();
        
        return response()->json($response);
    }

    public function videos(Request $request)
    {
        $lang = !empty($_COOKIE['locale']) ?$_COOKIE['locale']: 'en';
        $lang = $lang === 'en' ? "$lang-us" : "$lang-de";

        $response = Http::withHeaders(['Authorization' => $this->API_KEY])
            ->acceptJson()
            ->get("https://api.pexels.com/videos/search/",[
                "query" => $request->keyword,
                "per_page" => (int)$request->per_page,
                "page" => $request->has('page') ? (int)$request->page : 1,
                "locale" => $lang
            ])
            ->throw()
            ->json();
        
        return response()->json($response);
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
    public function store(Request $request)
    {
        //
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
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
