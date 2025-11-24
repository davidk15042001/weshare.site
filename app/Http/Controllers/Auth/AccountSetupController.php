<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\AccountSetupRequest;
use App\Models\Card;
use App\Models\CardCover;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use NumberFormatter;

class AccountSetupController extends Controller
{

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request)
    {
        $plan = null;
        if($request->user()->product){
            $plan = Plan::find($request->user()->product);
            if($plan){
                $formatter = new NumberFormatter('de_DE', NumberFormatter::CURRENCY);
                $plan->fprice = $formatter->formatCurrency($plan->price, 'EUR');
            }
        }
        if(Card::where('user_id', $request->user()->id)->exists()) return redirect()->route('dashboard');
        return Inertia::render('Auth/AccountSetup', [
            'email' => $request->user()->email,
            'plan' => $plan
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(AccountSetupRequest $request)
    {

        $identifier = strtolower(preg_replace('/[^a-zA-Z0-9.]+/', '-', $request->firstname.'-'.$request->lastname));
        if(Card::where('identifier', $identifier)->exists()){
            $identifier .= '-'.rand(10,99);
        }

        $cover = CardCover::find(1);

        $card = new Card();
        $card->user_id = auth()->id();
        $card->identifier = $identifier;
        $card->firstname = $request->firstname;
        $card->lastname = $request->lastname;
        $card->job = $request->job;
        $card->company = $request->company;
        $card->phone = $request->phone;
        $card->email = $request->email;
        $card->cover = $cover ? $cover->url : '';
        $card->primary = true;
        $card->settings = json_encode([
            "button" => [
                "color" =>  "#ffffff",
                "background"=> "#df2351"
            ],
            "place_name" => '',
            "place_id" =>  '',
            "cover_overlay" => "#df2351"
        ]);

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

        if($request->has('avatar')){
            if(strpos($request->avatar, ';base64') > 0){
                $card->avatar = $upload('avatars', $request->avatar);
            }else{
                $card->avatar = $request->avatar;
            }
        }

        $card->save();

        User::where('id', auth()->id())->update([
            'name' => $request->firstname . ' ' . $request->lastname
        ]);
        if(!empty($request->user()->contact)){
            DB::connection('backoffice')->table('contacts')->where('uid', $request->user()->contact)->update([
                'firstname' => $request->firstname,
                'lastname' => $request->lastname,
                'company' => $request->company
            ]);
        }

        return Inertia::location(route('stripe.plan', auth()->user()->product));
        
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
