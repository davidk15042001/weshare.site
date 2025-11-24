<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use App\Models\Plan;
use App\Providers\RouteServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Log;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     *
     * @param  \App\Http\Requests\Auth\LoginRequest  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(LoginRequest $request)
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(RouteServiceProvider::HOME);
    }

    public function handleGoogleCallback(Request $request)
    {
        Log::info('Google OAuth Callback', [
            'session_state' => session('state'),
            'request_state' => $request->input('state')
        ]);

        abort_if($request->missing('code'), 400, 'Missing auth code');

        abort_if($request->missing('state'), 400, 'Missing state');

        $auth = Socialite::driver('google')->stateless()->user();

        return $auth;
    }

    public function callback(Request $request, $driver='google'){

        try {
            $auth = Socialite::driver($driver)->user();
        } catch (\Exception $e) {
            return redirect()->route('login')->withErrors(['oauth' => 'Authentication failed. Please try again.']);
        }
    
        $user = User::where(function ($query) use ($auth) {
            $query->where('email', $auth->email)
                  ->orWhere('social_email', $auth->email);
        })->first();

        $free = Plan::where('slug', 'free')->first();

        if(!$user){
            $user = User::create([
                'social_email' => $auth->email,
                'email' => $auth->email,
                'name' => $auth->name,
                'password' => $auth->token,
                'product' => $request->session()->has('product') ? $request->session()->pull('product') : ($free->id ?? 0),
                'email_verified_at' => date('Y-m-d H:i:s')
            ]);
        }

        Auth::login($user, true);
        session()->regenerate();

        return redirect(RouteServiceProvider::HOME);

    }

    /**
     * Destroy an authenticated session.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
