<?php

namespace App\Http\Controllers;

use App\Http\Requests\CardProjectRequest;
use App\Models\CardProject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CardProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        if(!$request->has('card_id')) return abort(404);
        $services = CardProject::where('card_id', $request->card_id)->get();
        return response()->json($services);
    }


    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(CardProjectRequest $request)
    {
        $cardProject = new CardProject();
        $cardProject->card_id = $request->card_id;
        $cardProject->title = $request->title;
        $cardProject->description = $request->description;
        $cardProject->company = $request->company;
        $cardProject->link = $request->link;
        $cardProject->month = $request->month;
        $cardProject->year = $request->year;

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

        if($request->has('attachment')){
            if(strpos($request->attachment, ';base64') > 0){
                $cardProject->attachment = $upload('projects', $request->attachment);
            }else{
                $cardProject->attachment = $request->attachment;
            }
        }

        $cardProject->save();

        return response()->json($cardProject);
    }


    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\CardProject  $cardProject
     * @return \Illuminate\Http\Response
     */
    public function update(CardProjectRequest $request, CardProject $project)
    {
        $project->title = $request->title;
        $project->description = $request->description;
        $project->link = $request->link;
        $project->month = $request->month;
        $project->year = $request->year;

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

        if($request->has('attachment')){
            if(strpos($request->attachment, ';base64') > 0){
                $project->attachment = $upload('projects', $request->attachment);
            }else{
                $project->attachment = $request->attachment;
            }
        }

        $project->save();

        return response()->json($project);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\CardProject  $cardProject
     * @return \Illuminate\Http\Response
     */
    public function destroy(CardProject $project)
    {
        $project->delete();
        return response()->json(['message' => translate('Card project deleted')]);
    }
}
