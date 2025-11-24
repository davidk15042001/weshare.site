<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Providers\RouteServiceProvider;
use App\Models\User;
use App\Models\Plan;
use Illuminate\Support\Facades\Auth;

class GoogleController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            $free = Plan::where('slug', 'free')->first();
            // $user = User::where('email', $googleUser->getEmail())->first();
            // Find user or create a new one
            $user = User::updateOrCreate(
                ['social_email' => $googleUser->getEmail()],
                [
                    'email' => $googleUser->getEmail(),
                    'name' => $googleUser->getName(),
                    'password' => bcrypt(str()->random(16)), // Random password
                    // 'google_id' => $googleUser->getId(),
                    'product' => ($request->session()->has('product') ? $request->session()->pull('product') : ($free->id ?? 0)),
                    'email_verified_at' => date('Y-m-d H:i:s')
                ]
            );

            // Log the user in
            Auth::login($user);

            return redirect(RouteServiceProvider::HOME);
        } catch (\Exception $e) {
            return redirect('/login')->with('error', 'Failed to login with Google.');
        }
    }
}