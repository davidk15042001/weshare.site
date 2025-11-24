<?php

use App\Http\Controllers\AnalyticController;
use App\Http\Controllers\CallBackController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\CardCoverController;
use App\Http\Controllers\CardDocumentController;
use App\Http\Controllers\CardGalleryController;
use App\Http\Controllers\CardProjectController;
use App\Http\Controllers\CardServiceController;
use App\Http\Controllers\CustomCodesController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\SiteController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\TranslationController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\EnterpriseController;
use App\Http\Controllers\BulkUploadController;
use App\Http\Controllers\PexelController;
use App\Http\Controllers\VideoController;
use App\Models\Card;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/lg', function(){
    Auth::logout();
    return redirect('/');
});
Route::get('/preview/{identifier}', [CardController::class, 'show'])->name('cards.show');
Route::get('/team/admin/activate', [TeamController::class, 'adminActivation'])->name('teamAdminActivation')->middleware('guest');
Route::domain(env('APP_PREFIX', 'app') . '.' . env('APP_DOMAIN', 'vi-site.de'))->group(function () {

    Route::get('/authenticate/{id}', function (Request $request, $id) {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        $user = User::where('id', $id)->first();
        if ($user) {
            Auth::login($user);
            return redirect()->route('dashboard');
        }
        return abort(404);
    });
    Route::get('/plans/{interval?}', [SiteController::class, 'plans'])->name('site.plans');
    Route::get('/', function () {
        return redirect()->route('login');
    });
    Route::get('/stripe/plan/{id}', [PlanController::class, 'show'])->name('stripe.plan')->middleware('auth');

    Route::middleware(['auth', 'setup', 'prevent.back'])->group(function () {
        Route::get('/', function () {
            return redirect()->route('dashboard');
        });
        Route::get('/dashboard', [DashboardController::class, 'show'])->name('dashboard');
        Route::resource('cards', CardController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
        Route::post('/cards/initcard', [CardController::class, 'initcard'])->name('cards.initcard');
        Route::post('/cards/video/{card}', [VideoController::class, 'upload'])->name('cards.video');
        Route::get('/vimeo/authenticate', [VimeoController::class, 'authenticate']);
        Route::name('card.')->group(function () {
            Route::resource('cards/services', CardServiceController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::resource('cards/projects', CardProjectController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::resource('cards/galleries', CardGalleryController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::resource('cards/documents', CardDocumentController::class)->only(['index', 'store', 'destroy']);
            Route::resource('cards/customcodes', CustomCodesController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::resource('cards/covers', CardCoverController::class)->only(['store']);
        });
        Route::delete('cards/covers/{id}', [CardCoverController::class, 'destroy'])->name('card.covers.destroy');

        Route::get('/subscriptions/{interval?}', [SubscriptionController::class, 'index'])->name('subscriptions.index');

        Route::get('/billing', function (Request $request) {
            return $request->user()->redirectToBillingPortal($_SERVER['HTTP_REFERER']);
        })->name('billing');

        Route::get('analytics', [AnalyticController::class, 'index'])->name('analytics.index');
        Route::get('/callbacks', [CallBackController::class, 'index'])->name('callbacks.index');
        Route::get('/contacts', [CallBackController::class, 'contacts'])->name('contacts.index');
        Route::put('/contacts/{id}', [CallBackController::class, 'update'])->name('contacts.update');
        Route::delete('/contacts/{id}', [CallBackController::class, 'destroy'])->name('contacts.destroy');
        Route::get('/contacts/{id}/download', [CallBackController::class, 'download'])->name('contacts.download');

        Route::middleware(['enterprise'])->group(function () {
            Route::get('/team', [TeamController::class, 'index'])->name('team.index');
            Route::post('/team/request/bulkupload', [TeamController::class, 'requestBulkUpload'])->name('team.request.bulkupload');
            Route::post('/team/invitation', [TeamController::class, 'sendInvitation'])->name('team.invitation');
            Route::post('/teamsites', [TeamController::class, 'store'])->name('teamsites.store');
            Route::put('/teamsites/{id}', [TeamController::class, 'update'])->name('teamsites.update');
            Route::delete('/teamsites/{id}', [TeamController::class, 'destroy'])->name('teamsites.delete');

            Route::name('company.')->group(function () {
                Route::resource('/enterprises/settings', EnterpriseController::class)->only('index', 'create', 'store', 'update');
            });
            Route::post('/enterprises/settings/document', [EnterpriseController::class, 'storeDocument'])->name('company.settings.document.store');
        });

        Route::get('pexels/photos', [PexelController::class, 'photos'])->name('pexels.photos');
        Route::get('pexels/videos', [PexelController::class, 'videos'])->name('pexels.videos');

        Route::post('/subscriptions/redeemCoupon', [SubscriptionController::class, 'redeemCoupon'])->name('subscriptions.redeem');
    });

    Route::post('/subscriptions', [SubscriptionController::class, 'store'])->name('subscriptions.store')->middleware(['auth']);
    Route::resource('/translations', TranslationController::class)->only('index', 'store', 'update')->middleware('basic');
    Route::resource('/bulkupload', BulkUploadController::class)->only('index', 'store', 'update')->middleware('basic');
    Route::get('/bulkupload/export', [BulkUploadController::class, 'export'])->name('bulkupload.export')->middleware('basic');
    Route::post('/cards/qr/{card}', [CardController::class, 'qr'])->name('cards.qr');
    Route::get('/download/qr', [CardController::class, 'downloadQR'])->name('cards.downloadqr');
    Route::get('/download', [CardController::class, 'download'])->name('cards.download');
    Route::get('/contacts/export', [CallBackController::class, 'export'])->name('contacts.export');

    require __DIR__ . '/auth.php';
});

Route::get('/cards/reviews/scrape/{place_id}', [CardController::class, 'scrapeReviews'])->name('cards.scrape.reviews');
Route::get('/cards/reviews/{place_id}', [CardController::class, 'reviews'])->name('cards.reviews');
Route::post('/cards/callbacks', [CallBackController::class, 'store'])->name('cards.callbacks.store');

Route::domain('{identifier}.' . env('APP_DOMAIN', 'vi-site.de'))->group(function () {
    Route::get('/', [CardController::class, 'show'])->name('cards.show');
    Route::get('/download', [CardController::class, 'download'])->name('cards.download');
});
Route::post('analytics', [AnalyticController::class, 'store'])->name('analytics.store');

Route::get('/set/language', function () {
    $lang = isset($_GET['lang']) ? $_GET['lang'] : 'en';
    if (!in_array($lang, ['de', 'en'])) $lang = 'en';

    setcookie('locale', $lang, time() + 3600, "/");
    return back();
});


Route::get('/.well-known/apple-developer-merchantid-domain-association', function(){
    return file_get_contents(asset('apple-developer-merchantid-domain-association'));
});
