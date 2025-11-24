<?php

namespace App\Http\Controllers;

use App\Http\Requests\CardCoverRequest;
use App\Models\CardCover;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CardCoverController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(CardCoverRequest $request)
    {
        //$path = $request->file('file')->store('covers', 'public');

        $cover = new CardCover();

        if($request->has('enterprise') && boolval($request->enterprise) == true)
            $cover->enterprise_id = $request->user()->enterprise_id;
        else
            $cover->user_id = $request->user()->id;

        $upload = function ($path, $request) {
            $path = $path . '/';
            $base64Image = explode(";base64,", $request);
            $explodeImage = explode("image/", $base64Image[0]);
            $imageType = $explodeImage[1];
            $image_base64 = base64_decode($base64Image[1]);
            $file = $path . uniqid() . '.' . $imageType;
            Storage::disk('public')->put($file, $image_base64);
            return asset('storage/' . $file);
        };

        if ($request->has('cover')) {
            if (strpos($request->cover, ';base64') > 0) {
                $cover->url = $upload('covers', $request->cover);
            } else {
                $cover->url = $request->cover;
            }
        }

        if($request->has('thumbnail')) $cover->thumbnail = $request->thumbnail;
        if($request->has('type')) $cover->type = $request->type;

        $cover->save();

        return response()->json($cover);
    }


    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\CardCover  $cardCover
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $cardCover =  CardCover::findOrFail($id);
        $cardCover->delete();
        return response()->json($cardCover);
    }
}
