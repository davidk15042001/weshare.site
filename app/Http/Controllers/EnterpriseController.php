<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\CardCover;
use App\Models\Card;
use App\Models\CardService;
use App\Models\CardProject;
use App\Models\CardDocument;
use App\Models\CardGallery;
use App\Models\CardCustomCode;
use App\Models\EnterpriseSetting;
use App\Models\EnterpriseSettingDetail;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\CardDocumentRequest;

class EnterpriseController extends Controller
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
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request)
    {
        $details = EnterpriseSettingDetail::where('enterprise_id', $request->user()->enterprise_id)->first();
        $settingsSwitch = EnterpriseSetting::where('enterprise_id', $request->user()->enterprise_id)->first();
        $card = Card::where('user_id', $request->user()->id)->where('primary', 1)->first();
        $covers = CardCover::where('enterprise_id', $request->user()->enterprise_id)
            ->orWhere('user_id', null)
            ->orderByDesc('id')
            ->get();
        return Inertia::render('CompanySettings', [
            "settings" => $details,
            "settings_switch" => $settingsSwitch,
            "covers" => $covers,
            "card" => $card,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $details = EnterpriseSettingDetail::where('enterprise_id', $request->user()->enterprise_id)->first();
        if(!$details) {
            $details = new EnterpriseSettingDetail();
            $details->enterprise_id = $request->user()->enterprise_id;
        }

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

        if(isset($request->details['avatar'])) {
            if(strpos($request->details['avatar'], ';base64') > 0){
                $details->avatar = $upload('avatars', $request->details['avatar']);
            }else{
                $details->avatar = $request->details['avatar'];
            }
        } 

        if(isset($request->details['logo'])) {
            if(strpos($request->details['logo'], ';base64') > 0){
                $details->logo = $upload('logos', $request->details['logo']);
            }else{
                $details->logo = $request->details['logo'];
            }
        } 

        if(isset($request->details['galleries'])) {
            $galleries = [];
            foreach($request->details['galleries'] as $gallery) {
                if(strpos($gallery['url'], ';base64') > 0){
                    $gallery['url'] = $upload('galleries', $gallery['url']);
                }
                $galleries[] = $gallery;
            }
            $details->galleries = json_encode($galleries);
        }

        if(isset($request->details['projects'])) {
            $projects = [];
            foreach($request->details['projects'] as $project) {
                if(strpos($project['attachment'], ';base64') > 0){
                    $project['attachment'] = $upload('projects', $project['attachment']);
                }
                $projects[] = $project;
            }
            $details->projects = json_encode($projects);
        } 

        if(isset($request->details['cover'])) $details->cover = json_encode($request->details['cover']);
        if(isset($request->details['services'])) $details->services = json_encode($request->details['services']);
        if(isset($request->details['socials'])) $details->socials = json_encode($request->details['socials']);
        if(isset($request->details['documents'])) $details->documents = json_encode($request->details['documents']);
        if(isset($request->details['custom_codes'])) $details->custom_codes = json_encode($request->details['custom_codes']);
        if(isset($request->details['settings'])) $details->settings = json_encode($request->details['settings']);
        $details->save();
        
        $settings = EnterpriseSetting::where('enterprise_id', $request->user()->enterprise_id)->first();
        if(isset($request->settings['cover'])) $settings->cover = $request->settings['cover'];
        if(isset($request->settings['coavatarver'])) $settings->avatar = $request->settings['avatar'];
        if(isset($request->settings['logo'])) $settings->logo = $request->settings['logo'];
        if(isset($request->settings['services'])) $settings->services = $request->settings['services'];
        if(isset($request->settings['socials'])) $settings->socials = $request->settings['socials'];
        if(isset($request->settings['gallery'])) $settings->gallery = $request->settings['gallery'];
        if(isset($request->settings['projects'])) $settings->projects = $request->settings['projects'];
        if(isset($request->settings['custom_codes'])) $settings->custom_codes = $request->settings['custom_codes'];
        if(isset($request->settings['google_review'])) $settings->google_review = $request->settings['google_review'];
        if(isset($request->settings['colors'])) $settings->colors = $request->settings['colors'];
        $settings->save();

        if($request->has('apply_to_existing_users') && boolval($request->apply_to_existing_users == true)) {
            $users = User::where('enterprise_id', $request->user()->enterprise_id)->where('id', '<>', $request->user()->id)->get()->pluck('id');
            $cards = Card::whereIn('user_id', $users)->get();
            foreach($cards as $card) {
                $card->avatar = $details->avatar;
                $card->logo = $details->logo;
                $card->cover = $details->cover->src;
                $card->cover_thumbnail = $details->cover->thumbnail;
                $card->cover_type = $details->cover->type;
                $card->socials = json_encode($details->socials);
                $card->settings = json_encode($details->settings);
                $card->save();

                $services = CardService::where('card_id', $card->id)->delete();
                foreach($details->services as $service) {
                    $cardService = new CardService();
                    $cardService->card_id = $card->id;
                    $cardService->title = $service->title;
                    $cardService->description = $service->description;
                    $cardService->save();
                }

                $projects = CardProject::where('card_id', $card->id)->delete();
                foreach($details->projects as $project) {
                    $cardProject = new CardProject();
                    $cardProject->card_id = $card->id;
                    $cardProject->title = $project->title;
                    $cardProject->description = $project->description;
                    $cardProject->company = $project->company;
                    $cardProject->link = $project->link;
                    $cardProject->month = $project->month;
                    $cardProject->year = $project->year;
                    $cardProject->attachment = $project->attachment;
                    $cardProject->save();
                }

                $documents = CardDocument::where('card_id', $card->id)->delete();
                foreach($details->documents as $document) {
                    $cardDocument = new CardDocument();
                    $cardDocument->card_id = $card->id;
                    $cardDocument->title = $document->title;
                    $cardDocument->path = $document->path;
                    $cardDocument->save();
                }

                $galleries = CardGallery::where('card_id', $card->id)->delete();
                foreach($details->galleries as $gallery) {
                    $cardGallery = new CardGallery();
                    $cardGallery->card_id = $card->id;
                    $cardGallery->url = $gallery->url;
                    $cardGallery->save();
                }

                $customCodes = CardCustomCode::where('card_id', $card->id)->delete();
                foreach($details->custom_codes as $custom_code) {
                    $code = new CardCustomCode();
                    $code->card_id = $card->id;
                    $code->title = $custom_code->title;
                    $code->codes = $custom_code->codes;
                    $code->source = $custom_code->source;
                    $code->save();
                }
            }
        }

        return response()->json([
            "settings" => $settings,
            "details" => $details
        ]);
    }

    public function storeDocument(Request $request)
    {
        $details = EnterpriseSettingDetail::where('enterprise_id', $request->user()->enterprise_id)->first();
        if(!$details) {
            $details = new EnterpriseSettingDetail();
            $details->enterprise_id = $request->user()->enterprise_id;
        }

        $path = $request->file('file')->store(
            'documents/enterprise'.$request->user()->enterprise_id, 'public'
        );
        $filesize = filesize(public_path('storage/'.$path));

        $documents = $details->documents;
        usort($documents,function($a, $b){
            return (int)$a->id < (int)$b->id;
        });

        $document = [
            "id" => count($documents) > 0 ? (int) $documents[0]->id + 1 : 1,
            "title" => $request->title,
            "path" => $path,
            "size" => round($filesize / 1024, 2)
        ];

        $documents[] = $document;

        $details->documents = json_encode($documents);
        $details->save();

        return response()->json($document);
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
