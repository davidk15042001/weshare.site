<?php

use App\Http\Controllers\Auth\AccountSettingsController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\Auth\AccountSetupController;
// use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\PaymentMethodController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Laravel\Socialite\Facades\Socialite;


Route::middleware(['guest', 'prevent.back'])->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])
                ->name('register');
    Route::get('set/password', [RegisteredUserController::class, 'setpassword'])
                ->name('setpassword');
    Route::post('savepassword', [RegisteredUserController::class, 'savepassword'])
                ->name('savepassword');

    Route::post('register', [RegisteredUserController::class, 'store']);

    Route::get('login', [AuthenticatedSessionController::class, 'create'])
                ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    Route::get('forgot/password', [PasswordResetLinkController::class, 'create'])
                ->name('password.request');

    Route::post('forgot/password', [PasswordResetLinkController::class, 'store'])
                ->name('password.email');

    Route::get('reset/password/{token}', [NewPasswordController::class, 'create'])
                ->name('password.reset');

    Route::post('reset/password', [NewPasswordController::class, 'store'])
                ->name('password.update');

    Route::get('/auth/social/redirect', function (Request $request) {

        $driver = $request->has('driver') ? $request->driver : 'google';
        if($request->has('product')) $request->session()->put('product', $request->product);

        return Socialite::driver($driver)->redirect();

    })->name('social.redirect');
    // Route::get('auth/callback/google', [GoogleController::class, 'handleGoogleCallback']);

    Route::get('/auth/callback/{driver}', [AuthenticatedSessionController::class, 'callback'])->name('social.callback');

});

Route::middleware(['auth', 'prevent.back'])->group(function () {
    Route::get('verify/email', [EmailVerificationPromptController::class, '__invoke'])
                ->name('verification.notice');

    Route::get('verify/email/{id}/{hash}', [VerifyEmailController::class, '__invoke'])
                ->middleware(['signed', 'throttle:6,1'])
                ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
                ->middleware('throttle:6,1')
                ->name('verification.send');

    Route::get('confirm/password', [ConfirmablePasswordController::class, 'show'])
                ->name('password.confirm');

    Route::post('confirm/password', [ConfirmablePasswordController::class, 'store']);

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
                ->name('logout');

    Route::get('logout', [AuthenticatedSessionController::class, 'destroy'])
                ->name('logout.get');

    Route::get('account', function(){
        return redirect()->route('account.settings');
    });

    Route::get('account/setup', [AccountSetupController::class, 'create'])
                ->name('account.setup');
                
    Route::post('account/setup', [AccountSetupController::class, 'store'])
                ->name('account.setup');

    Route::get('account/payments', [PaymentMethodController::class, 'create'])
                ->name('account.payments.create')->middleware('setup');

    Route::put('account/payments/{paymentmethod}', [PaymentMethodController::class, 'update'])
                ->name('account.payments.edit');

    Route::delete('account/payments/{paymentmethod}', [PaymentMethodController::class, 'destroy'])
                ->name('account.payments.destroy');
                
    Route::get('account/payments/complete', [PaymentMethodController::class, 'store'])
                ->name('account.payments.complete');


    Route::get('account/settings', [AccountSettingsController::class, 'settings'])
                ->name('account.settings')->middleware('setup');

    Route::post('account/deactivate', [AccountSettingsController::class, 'deactivate'])
                ->name('account.deactivate');
    Route::post('account/delete', [AccountSettingsController::class, 'destroy'])
                ->name('account.delete');

    Route::post('change/password', [AccountSettingsController::class, 'changePassword'])
                ->name('change.password');

    Route::post('change/account', [AccountSettingsController::class, 'changeAccount'])
                ->name('change.account');

});
