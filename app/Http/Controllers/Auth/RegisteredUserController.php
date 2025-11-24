<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use NumberFormatter;
use stdClass;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     *
     * @return \Inertia\Response
     */
    public function create(Request $request)
    {
        $plan = null;
        if($request->has('plan')){
            $plan = Plan::find($request->plan);
            if($plan){
                $formatter = new NumberFormatter('de_DE', NumberFormatter::CURRENCY);
                $plan->fprice = $formatter->formatCurrency($plan->price, 'EUR');
            }
        }
        
        return Inertia::render('Auth/Register', [
            'plan' => $plan
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
    {
        $request->validate([
            // 'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'terms' => 'accepted'
        ]);

        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'product' => $request->product
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(RouteServiceProvider::HOME);
    }

    public function setpassword(Request $request)
    {
        if(!$request->has('token')) return abort(404);

        $user = User::where('password', $request->token)->first();
        if(!$user) return abort(404);

        return Inertia::render('Auth/SetPassword', [
            'id' => $user->id,
            'email' => $user->email
        ]);
    }

    public function savepassword(Request $request)
    {
        $request->validate([
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'terms' => 'accepted'
        ]);

        $user = User::find($request->id);
        $user->password = Hash::make($request->password);
        $user->email_verified_at = date('Y-m-d H:i:s');
        $user->save();

        Auth::login($user);

        return redirect(RouteServiceProvider::HOME);
    }
}
