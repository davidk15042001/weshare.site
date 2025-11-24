<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CardGallery;
use App\Http\Requests\CardGalleryRequest;
use Illuminate\Support\Facades\Storage;

class CardGalleryController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        if(!$request->has('card_id')) return abort(404);
        $galleries = CardGallery::where('card_id', $request->card_id)->get();
        return response()->json($galleries);
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
    public function store(CardGalleryRequest $request)
    {
        $cardGallery = new CardGallery();
        $cardGallery->card_id = $request->card_id;
        if($request->has('type')) $cardGallery->type = $request->type;
        if($request->has('thumbnail')) $cardGallery->thumbnail = $request->thumbnail;

        $upload = function($path, $request){
            $path = $path.'/';
            $base64Image = explode(";base64,", $request);
            $explodeImage = explode("image/", $base64Image[0]);
            $imageType = $explodeImage[1];
            $image_base64 = base64_decode($base64Image[1]);
            $file = $path . uniqid() . '.'.$imageType;
            Storage::disk('public')->put($file, $image_base64);
            return asset('storage/'.$file);
        };

        if($request->has('file')){
            if(strpos($request->file, ';base64') > 0){
                $cardGallery->url = $upload('galleries', $request->file);
            }else{
                $cardGallery->url = $request->file;
            }
        }

        $cardGallery->save();

        return response()->json($cardGallery);
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
        $cardGallery = CardGallery::find($id);
        $cardGallery->delete();
        return response()->json($cardGallery);
    }
}
