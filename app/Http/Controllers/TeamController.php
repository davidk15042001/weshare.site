<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Mail\SendBulkUpload;
use App\Mail\ReceivedBulkUploadRequest;
use App\Mail\SendInvitation;
use Illuminate\Support\Facades\Mail;
use App\Http\Requests\TeamRequest;
use App\Http\Requests\EditAccountRequest;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Card;
use App\Models\CardCover;
use App\Models\CardService;
use App\Models\CardProject;
use App\Models\CardDocument;
use App\Models\CardGallery;
use App\Models\CardCustomCode;
use App\Models\Plan;
use App\Models\EnterpriseSetting;
use App\Models\EnterpriseSettingDetail;
use Illuminate\Support\Facades\Auth;

class TeamController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $c2c = DB::connection('backoffice')->table('c2c')->where('cuid2', Auth::user()->contact)->first();
        $company = DB::connection('backoffice')->table('contacts')->where('uid', $c2c->cuid)->first();

        $contactIds = DB::connection('backoffice')
            ->table('contacts as c')
            ->leftJoin('c2c', 'c.uid', '=', 'c2c.cuid2')
            ->select('c.uid as id', 'c.firstname', 'c.lastname', 'c.active')
            ->where('c2c.cuid', $c2c->cuid)
            ->where('c.active', 1)
            //->where('c.uid', '<>', Auth::user()->contact)
            ->get()
            ->pluck('id');

        $cards = DB::table('users as u')
            ->leftJoin('cards as c', 'u.id', '=', 'c.user_id')
            ->select('u.contact as contact_id', 'u.name as name', 'u.email as uemail', 'u.email_verified_at', 'u.sent_invitation', 'c.*')
            ->whereIn('u.contact', $contactIds)
            ->where('c.primary', 1)
            ->where('c.deleted_at', NULL)
            ->whereNull('u.deleted_at')
            ->get();

        $cards->each(function($card) {
            $card->contactDetails = DB::connection('backoffice')->table('contacts')
                ->where('uid', $card->contact_id)
                ->select('firstname', 'lastname', 'company', 'address', 'telephone', 'cellphone')
                ->first();
        });

        return Inertia::render('Team', [
            'company' => $company,
            'cards' => $cards
        ]);
    }

    public function requestBulkUpload(Request $request)
    {
        $c2c = DB::connection('backoffice')->table('c2c')->where('cuid2', Auth::user()->contact)->first();
        $contact = DB::connection("backoffice")->table('contacts')->where('uid', $c2c->cuid)->first();

        $data = [
            "name" => $request->user()->name,
            "email" => $request->user()->email,
            "company" => $contact ? $contact->company : '',
            "numOfSites" => $request->numOfSites,
            "message" => $request->message ?? '',
        ];
        Mail::to($request->user()->email)->send(new SendBulkUpload($data));
        Mail::to('karim@mediaonearth.com')->send(new ReceivedBulkUploadRequest($data));

        return response()->json($data);
    }

    public function sendInvitation(Request $request)
    {
        $user = User::find($request->id);
        $data = [
            "name" => $user->name,
            "token" => $user->password,
            "created_by" => $request->user()->name
        ];

        Mail::to($user->email)->send(new SendInvitation($data));

        $user->sent_invitation = date('Y-m-d H:i:s');
        $user->save();

        return response()->json($data);
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
    public function store(TeamRequest $request)
    {
        $product = Plan::where('slug', 'enterprise')->first();
        
        $token = uniqid(rand(), true).time();

        $user = User::create([
            'name' => "$request->firstname $request->lastname",
            'email' => $request->email,
            'password' => $token,
            'product' => $product->id
        ]);

        $identifier = strtolower(preg_replace('/[^a-zA-Z0-9.]+/', '-', $request->firstname.'-'.$request->lastname));
        if(Card::where('identifier', $identifier)->exists()){
            $identifier .= '-'.rand(10,99);
        }

        $cover = CardCover::find(1);

        $card = new Card();
        $card->user_id = $user->id;
        $card->identifier = $identifier;
        $card->primary = true;
        $card->cover = $cover->url;
        $card->firstname = $request->firstname;
        $card->lastname = $request->lastname;
        $card->job = $request->jobTitle;
        $card->email = $request->email;

        if($request->has('company')) $card->company = $request->company;
        if($request->has('phone')) $card->phone = $request->phone;
        if($request->has('mobile')) $card->mobile = $request->mobile;
        if($request->has('address')) $card->address = $request->address;

        if($request->has('socials')){
            $socials = $request->socials;
            if(is_array($socials) || is_object($socials)) $socials = json_encode($socials);
            $card->socials = $socials;
        }
        $card->save();
        
        $company = DB::connection('backoffice')->table('c2c')->where('cuid2', $request->user()->contact)->first();
        $settingDetails = EnterpriseSettingDetail::where('enterprise_id', $company->cuid)->first();
        if($settingDetails) {
            $card->avatar = $settingDetails->avatar;
            $card->logo = $settingDetails->logo;
            $card->cover = $settingDetails->cover->src;
            $card->cover_thumbnail = $settingDetails->cover->thumbnail;
            $card->cover_type = $settingDetails->cover->type;
            $card->socials = json_encode($settingDetails->socials);
            $card->settings = json_encode($settingDetails->settings);
            $card->save();

            foreach($settingDetails->services as $service) {
                $cardService = new CardService();
                $cardService->card_id = $card->id;
                $cardService->title = $service->title;
                $cardService->description = $service->description;
                $cardService->save();
            }

            foreach($settingDetails->projects as $project) {
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

            foreach($settingDetails->documents as $document) {
                $cardDocument = new CardDocument();
                $cardDocument->card_id = $card->id;
                $cardDocument->title = $document->title;
                $cardDocument->path = $document->path;
                $cardDocument->save();
            }

            foreach($settingDetails->galleries as $gallery) {
                $cardGallery = new CardGallery();
                $cardGallery->card_id = $card->id;
                $cardGallery->url = $gallery->url;
                $cardGallery->save();
            }

            foreach($settingDetails->custom_codes as $custom_code) {
                $code = new CardCustomCode();
                $code->card_id = $card->id;
                $code->title = $custom_code->title;
                $code->codes = $custom_code->codes;
                $code->source = $custom_code->source;
                $code->save();
            }
        }

        $user->refresh();
        if(!empty($user->contact)){
            DB::connection('backoffice')->table('contacts')->where('uid', $user->contact)->update([
                'firstname' => $request->firstname,
                'lastname' => $request->lastname,
                'company' => $request->company,
                'address' => $request->address,
                'telephone' => $request->phone,
                'cellphone' => $request->mobile,
            ]);
        }

        if($card && boolval($request->invitation) == true) {
            Mail::to($request->email)->send(new SendInvitation([
                "name" => $user->name,
                "token" => $user->password,
                "created_by" => $request->user()->name
            ]));
            User::where('id', $user->id)->update(['sent_invitation'=>date('Y-m-d H:i:s')]);
        }

        $card = DB::table('users as u')
            ->leftJoin('cards as c', 'u.id', '=', 'c.user_id')
            ->select('u.contact as contact_id', 'u.name as name', 'u.email as uemail', 'u.email_verified_at', 'u.sent_invitation', 'c.*')
            ->where('u.contact', $user->contact)
            ->where('c.primary', 1)
            ->where('c.deleted_at', NULL)
            ->first();

        $card->contactDetails = DB::connection('backoffice')->table('contacts')
            ->where('uid', $card->contact_id)
            ->select('firstname', 'lastname', 'company', 'address', 'telephone', 'cellphone')
            ->first();

        return response()->json($card);
    }

    public function adminActivation(Request $request){
        
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if(!$request->has('token')) return abort(404);

        $contact = DB::connection('backoffice')->table('contacts')->where('password_token', $request->token)->first();
        if(!$contact) return abort(404);

        $c2c = DB::connection('backoffice')->table('c2c')->where('cuid2', $contact->uid)->first();

        $product = Plan::where('slug', 'enterprise')->first();

        $user = new User();
        $user->name = "$contact->firstname $request->contact";
        $user->email = $contact->email;
        $user->password = $request->token;
        $user->product = $product->id;
        $user->contact = $contact->uid;
        $user->enterprise_id = $c2c->cuid;

        $user->saveQuietly();

        $settings = EnterpriseSetting::where('enterprise_id', $c2c->cuid)->first();
        if(!$settings) {
            EnterpriseSetting::create(["enterprise_id" => $c2c->cuid]);
        }

        $identifier = strtolower(preg_replace('/[^a-zA-Z0-9.]+/', '-', $contact->firstname.'-'.$contact->lastname));
        if(Card::where('identifier', $identifier)->exists()){
            $identifier .= '-'.rand(10,99);
        }

        $cover = CardCover::find(1);

        $card = new Card();
        $card->user_id = $user->id;
        $card->identifier = $identifier;
        $card->primary = true;
        $card->cover = $cover->url;
        $card->firstname = $contact->firstname;
        $card->lastname = $contact->lastname;
        $card->job = '';
        $card->email = $contact->email;

        $group = DB::connection('backoffice')->table('contactgroups')
            ->leftJoin('con_group', 'con_group.groupuid', '=', 'contactgroups.uid')
            ->where('con_group.cuid', $contact->uid)
            ->select('contactgroups.*')
            ->first();

        if($group) $card->company = $group->name;

        $card->save();

        $settingDetails = EnterpriseSettingDetail::where('enterprise_id', $c2c->cuid)->first();
        if($settingDetails) {
            $card->avatar = $settingDetails->avatar;
            $card->logo = $settingDetails->logo;
            $card->cover = $settingDetails->cover->src;
            $card->cover_thumbnail = $settingDetails->cover->thumbnail;
            $card->cover_type = $settingDetails->cover->type;
            $card->socials = json_encode($settingDetails->socials);
            $card->settings = json_encode($settingDetails->settings);
            $card->save();

            foreach($settingDetails->services as $service) {
                $cardService = new CardService();
                $cardService->card_id = $card->id;
                $cardService->title = $service->title;
                $cardService->description = $service->description;
                $cardService->save();
            }

            foreach($settingDetails->projects as $project) {
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

            foreach($settingDetails->documents as $document) {
                $cardDocument = new CardDocument();
                $cardDocument->card_id = $card->id;
                $cardDocument->title = $document->title;
                $cardDocument->path = $document->path;
                $cardDocument->save();
            }

            foreach($settingDetails->galleries as $gallery) {
                $cardGallery = new CardGallery();
                $cardGallery->card_id = $card->id;
                $cardGallery->url = $gallery->url;
                $cardGallery->save();
            }

            foreach($settingDetails->custom_codes as $custom_code) {
                $code = new CardCustomCode();
                $code->card_id = $card->id;
                $code->title = $custom_code->title;
                $code->codes = $custom_code->codes;
                $code->source = $custom_code->source;
                $code->save();
            }
        }

        DB::connection('backoffice')->table('contacts')->where('uid', $contact->uid)->update(['password_token' => '']);

        return redirect()->route('setpassword', ['token' => $request->token]);
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
    public function update(EditAccountRequest $request, $id)
    {
        $user = User::find($id);
        if($request->has('firstname') || $request->has('lastname')) $user->name = "$request->firstname $request->lastname";
        if($request->has('email')) $user->email = $request->email;
        $user->save();

        if(!empty($user->contact)){
            DB::connection('backoffice')->table('contacts')->where('uid', $user->contact)->update([
                'firstname' => $request->firstname,
                'lastname' => $request->lastname,
                'company' => $request->company,
                'address' => $request->address,
                'email' => $request->email,
                'telephone' => $request->phone,
                'cellphone' => $request->mobile
            ]);
        }

        $card = DB::table('users as u')
            ->leftJoin('cards as c', 'u.id', '=', 'c.user_id')
            ->select('u.contact as contact_id', 'u.name as name', 'u.email as uemail', 'u.email_verified_at', 'u.sent_invitation', 'c.*')
            ->where('u.contact', $user->contact)
            ->where('c.primary', 1)
            ->where('c.deleted_at', NULL)
            ->first();
        $card->contactDetails = DB::connection('backoffice')->table('contacts')
            ->where('uid', $card->contact_id)
            ->select('firstname', 'lastname', 'company', 'address', 'telephone', 'cellphone')
            ->first();
        
        return response()->json($card);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $user = User::find($id);
        $user->forceDelete();

        DB::connection('backoffice')->table('contacts')
            ->where('uid', $user->contact)
            ->update(['archive' => 1, 'active' => 0]);
        
        Card::where('user_id', $user->id)->forceDelete();

        return response()->json($user);
    }
}
