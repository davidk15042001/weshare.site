<?php

namespace App\Http\Controllers;

use App\Http\Requests\CardRequest;
use App\Models\Analytic;
use App\Models\Card;
use App\Models\CardCover;
use App\Models\CardDocument;
use App\Models\CardProject;
use App\Models\CardService;
use App\Models\CardCustomCode;
use App\Models\CardGallery;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\EnterpriseSetting;
use App\Models\GoogleReview;
use Carbon\Carbon;
use GuzzleHttp\Client as GClient;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use JeroenDesloovere\VCard\VCard;
use Illuminate\Support\Facades\DB;
use App\Service\VCardService;
use Drnxloc\LaravelHtmlDom\HtmlDomParser;
use Illuminate\Support\Facades\Http;
use Symfony\Component\Panther\Client;
use Symfony\Component\Panther\DomCrawler\Crawler;

class CardController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $cards = Card::where('user_id', $request->user()->id)->get();
        $create = false;
        if (!$cards) $create = true;

        return Inertia::render('Cards', [
            'cards' => $cards,
            'create' => $create,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request)
    {
        $covers = CardCover::where('user_id', $request->user()->id)
            ->orWhere(function($query) {
                $query->where('user_id', null)->where('enterprise_id', null);
            })
            ->orderByDesc('user_id')
            ->get();
            
        return Inertia::render('CardForm', [
            'card' => ['covers' => $covers],
        ]);
    }

    public function initcard(Request $request)
    {
        $str_result = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        $identifier = 'new-'.substr(str_shuffle($str_result), 0, 10);
        
        if(Card::where('identifier', $identifier)->exists()){
            $identifier .= '-'.rand(10,99);
        }

        $card = new Card();
        $card->user_id = auth()->id();
        $card->identifier = $identifier;
        $card->firstname = '';
        $card->lastname = '';
        $card->save();

        return Inertia::location(route('cards.edit', $card->id));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $identifier = empty($request->identifier)
            ? strtolower(preg_replace('/[^a-zA-Z0-9.]+/', '-', $request->firstname.'-'.$request->lastname))
            : $request->identifier;

        if(Card::where('identifier', $identifier)->exists()){
            $identifier .= '-'.rand(10,99);
        }

        $card = new Card();
        $card->user_id = auth()->id();
        $card->identifier = $identifier;
        $card->firstname = $request->firstname;
        $card->lastname = $request->lastname;
        $card->about = $request->about;
        $card->address = $request->address;
        $card->job = $request->job;
        $card->company = $request->company;
        $card->phone = $request->phone;
        $card->email = $request->email;
        
        if($request->has('socials')){
            $socials = $request->socials;
            if(is_array($socials) || is_object($socials)) $socials = json_encode($socials);
            $card->socials = $socials;
        }
        if($request->has('settings')){
            $settings = $request->settings;
            if(is_array($settings) || is_object($settings)) $settings = json_encode($settings);
            $card->settings = $settings;
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

        if($request->has('avatar')){
            if(strpos($request->avatar, ';base64') > 0){
                $card->avatar = $upload('avatars', $request->avatar);
            }else{
                $card->avatar = $request->avatar;
            }
        }

        if($request->has('cover')){
            if(strpos($request->cover, ';base64') > 0){
                $card->cover = $upload('covers', $request->cover);
            }else{
                $card->cover = $request->cover;
            }
        }

        if($request->has('cover_thumbnail')) $card->cover_thumbnail = $request->cover_thumbnail;
        if($request->has('cover_type')) $card->cover_type = $request->cover_type;

        if($request->has('logo')){
            if(strpos($request->logo, ';base64') > 0){
                $card->logo = $upload('logos', $request->logo);
            }else{
                $card->logo = $request->logo;
            }
        }

        $card->save();

        $card->url = env('APP_PROTOCOL', 'https').'://' . $card->identifier . '.' . env('APP_DOMAIN', 'vi-site.de').'?ref=qr';
        $card->services = CardService::where('card_id', $card->id)->get();
        $card->projects = CardProject::where('card_id', $card->id)->get();
        $card->documents = CardDocument::where('card_id', $card->id)->get();
        $card->customcodes = CardCustomCode::where('card_id', $card->id)->get();
        $card->galleries = CardGallery::where('card_id', $card->id)->get();

        $card->documents->each(function($document) {
            $filesize = filesize(public_path('storage/'.$document->path));
            $document->size = round($filesize / 1024, 2);
        });

        $card->covers = CardCover::where('user_id', $request->user()->id)->orWhere('user_id', null)->orderByDesc('user_id')->get();

        return response()->json($card);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Card  $card
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $identifier)
    {
        $card = Card::where('identifier', $identifier)->first();
        if(!$card) return abort(404);


        $analytics = function($key, $type) use($card){
            if(empty($_COOKIE[$key])){
                setcookie($key, 1, time() + 3600, "/");
                $analytics = Analytic::where('card_id', $card->id)
                                    ->where('type', $type)
                                    ->where('date', date('Y-m-d'))
                                    ->first();
                if(!$analytics){
                    $analytics = new Analytic();
                    $analytics->card_id = $card->id;
                    $analytics->type = $type;
                    $analytics->date = date('Y-m-d');
                    $analytics->counter = 0;
                }
                $analytics->counter += 1;
                $analytics->save();
            }
        };

        $key = 'visit-'.$card->id;
        $analytics($key, 'visit');
        if($request->has('ref') && $request->ref == 'qr'){
            $key = 'qrcode-'.$card->id;
            $analytics($key, 'scan');
        }

        $card->url = env('APP_PROTOCOL', 'https').'://' . $card->identifier . '.' . env('APP_DOMAIN', 'vi-site.de').'?ref=qr';

        $settings = [
            'placeId' => $card->settings->place_id ?? '',
            'placeName' => $card->settings->place_name ?? '',
            'show_review' => $card->settings->show_review ?? true,
            'cover_overlay' => $card->settings->cover_overlay ?? '#df2351',
            'color' => $card->settings->button->color ?? '#ffffff',
            'background' => $card->settings->button->background ?? '#df2351',
            'qrColor' => $card->settings->qr_color ?? '#df2351',
            'formColor' => $card->settings->form_color ?? '#041E4F',
            'contactButtons' => $card->settings->contactButtons ?? [],
            'metaTitle' => $card->settings->seo->metaTitle ?? "$card->firstname $card->lastname",
            'metaDescription' => $card->settings->seo->metaDescription ?? "$card->job at $card->company",
            'imprint' => $card->settings->footer->imprint ?? '',
            'privacyPolicy' => $card->settings->footer->privacyPolicy ?? '',
        ];

        $documents = CardDocument::where('card_id', $card->id)->get()->each(function($document) {
            $filesize = filesize(public_path('storage/'.$document->path));
            $document->size = round($filesize / 1024, 2);
        });

        return Inertia::render('SitePreview', [
            'isPublic' => true,
            'card' => $card,
            'socials' => $card->socials ?? [],
            'projects' => CardProject::where('card_id', $card->id)->get(),
            'services' => CardService::where('card_id', $card->id)->get(),
            'customCodes' => CardCustomCode::where('card_id', $card->id)->get(),
            'galleries' => CardGallery::where('card_id', $card->id)->get(),
            'documents' => $documents,
            'settings' => $settings,
            'preview' => false
        ]);

    }


    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Card  $card
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request, Card $card)
    {

        // $settings = json_decode($request->settings);

        if ($request->user()->id !== $card->user_id) {
            return redirect()->route('cards.index')->with('error', 'You are not allowed to edit this card.');
        }

        $card->url = env('APP_PROTOCOL', 'https').'://' . $card->identifier . '.' . env('APP_DOMAIN', 'vi-site.de').'?ref=qr';
        $card->services = CardService::where('card_id', $card->id)->get();
        $card->projects = CardProject::where('card_id', $card->id)->get();
        $card->documents = CardDocument::where('card_id', $card->id)->get();
        $card->customcodes = CardCustomCode::where('card_id', $card->id)->get();
        $card->galleries = CardGallery::where('card_id', $card->id)->get();

        $card->documents->each(function($document) {
            $filesize = filesize(public_path('storage/'.$document->path));
            $document->size = round($filesize / 1024, 2);
        });

        $card->covers = CardCover::where('user_id', $request->user()->id)
            ->orWhere(function($query) {
                $query->where('user_id', null)->where('enterprise_id', null);
            })
            ->orderByDesc('id')->get();
        
        $settings = [
            "cover" => true,
            "avatar" => true,
            "logo" => true,
            "services" => true,
            "socials" => true,
            "gallery" => true,
            "projects" => true,
            "documents" => true,
            "custom_codes" => true,
            "google_review" => true,
            "colors" => true
        ];

        $siteAdmin = DB::connection('backoffice')->table('contacts')
            ->leftJoin('con_group', 'con_group.cuid','=', 'contacts.uid')
            ->leftJoin('contactgroups', 'contactgroups.uid', '=', 'con_group.groupuid')
            ->where('contactgroups.name', 'WeShare Admin')
            ->where('contacts.uid', $request->user()->contact)
            ->exists();

        if(!is_null($request->user()->enterprise_id) && !$siteAdmin) {
            $settings = EnterpriseSetting::where('enterprise_id', $request->user()->enterprise_id)->first();
        }
        
        return Inertia::render('CardForm', [
            'card' => $card,
            'settings' => $settings,
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Card  $card
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Card $card)
    {
        if($request->has('identifier')) {
            // if(strpos($request->identifier, 'new-') !== false && !empty($request->firstname) && !empty($request->lastname)) {
            //     $identifier = strtolower(preg_replace('/[^a-zA-Z0-9.]+/', '-', $request->firstname.'-'.$request->lastname));
            // } else {
            //     $identifier = $request->identifier;
            // }
            $identifier = $request->identifier;

            if (strpos($identifier, 'new-') === 0) {
                if (!empty($request->firstname) && !empty($request->lastname)) {
                    $identifier = strtolower(preg_replace('/[^a-zA-Z0-9.]+/', '-', $request->firstname . '-' . $request->lastname));
                } else {
                    $identifier = 'draft-' . substr($identifier, 4);
                }
            } elseif (strpos($identifier, 'draft-') === 0 && !empty($request->firstname) && !empty($request->lastname)) {
                $identifier = strtolower(preg_replace('/[^a-zA-Z0-9.]+/', '-', $request->firstname . '-' . $request->lastname));
            }

            if($identifier != $card->identifier) {
                if(Card::where('identifier', $identifier)->exists()){
                    $identifier .= '-'.rand(10,99);
                }
            }
    
            $card->identifier = $identifier;
        }

        if($request->has('title')) $card->title = $request->title;
        if($request->has('firstname')) $card->firstname = $request->firstname;
        if($request->has('lastname')) $card->lastname = $request->lastname;
        if($request->has('about')) $card->about = $request->about;
        if($request->has('email')) $card->email = $request->email;
        if($request->has('phone')) $card->phone = $request->phone;
        if($request->has('mobile')) $card->mobile = $request->mobile;
        if($request->has('job')) $card->job = $request->job;
        if($request->has('company')) $card->company = $request->company;
        if($request->has('address')) $card->address = $request->address;
        if($request->has('socials')){
            $socials = $request->socials;
            if(is_array($socials) || is_object($socials)) $socials = json_encode($socials);
            $card->socials = $socials;
        }
        if($request->has('settings')){
            $settings = $request->settings;
            if(is_array($settings) || is_object($settings)) $settings = json_encode($settings);
            $card->settings = $settings;
        }
        if($request->has('status')) $card->status = $request->status;
        if($request->has('primary')) $card->primary = $request->primary;

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
        if($request->has('cover')){
            if(strpos($request->cover, ';base64') > 0){
                $card->cover = $upload('covers', $request->cover);
            }else{
                $card->cover = $request->cover;
            }
        }
        
        if($request->has('cover_thumbnail')) $card->cover_thumbnail = $request->cover_thumbnail;
        if($request->has('cover_type')) $card->cover_type = $request->cover_type;

        if($request->has('logo')){
            if(strpos($request->logo, ';base64') > 0){
                $card->logo = $upload('logos', $request->logo);
            }else{
                $card->logo = $request->logo;
            }
        }

        $card->save();

        return response()->json($card);
    }


    public function qr(Request $request, Card $card){
        $size = $request->size ?? 'small';
        $color = $request->color ?? 'white';
        if(!in_array($size, ['small', 'medium'])) return abort(404);
        if(!in_array($color, ['white', 'black'])) return abort(404);

        $domain = explode('.', $_SERVER['SERVER_NAME']);
        $domain = array_slice($domain, -2, 2, true);
        $domain = implode('.', $domain);

        // $data = 'https://' . $card->identifier . '.' . $domain . '?ref=qr';
        $data = env('APP_PROTOCOL', 'https').'://' . $card->identifier . '.' . $domain.'?ref=qr';

        $image = \SimpleSoftwareIO\QrCode\Facades\QrCode::format('png');
        if($color == 'white'){
            $image->color(255,255,255);
            $image->backgroundColor(255,255,255,0);
        }
        if($color == 'black') {
            //$image->color(4, 30, 79);
            $image->color(0, 0, 0);
            $image->backgroundColor(255,255,255,0);
        }

        if($size == 'medium'){
            $image->size(300);
        }else{
            $image->size(100);
        }
        $image = $image->errorCorrection('H')->generate($data);
        return response($image)->header('Content-type','image/png');

    }

    public function downloadQR(Request $request, $identifier = ''){
        if(empty($identifier) && $request->has('identifier')) $identifier = $request->identifier;
        $card = Card::where('identifier', $identifier)->first();
        if(!$card) return abort(404);

        $size = $request->size ?? 'small';
        $color = $request->color ?? 'white';
        if(!in_array($size, ['small', 'medium'])) return abort(404);
        if(!in_array($color, ['white', 'black'])) return abort(404);

        $domain = explode('.', $_SERVER['SERVER_NAME']);
        $domain = array_slice($domain, -2, 2, true);
        $domain = implode('.', $domain);

        // $data = 'https://' . $card->identifier . '.' . $domain . '?ref=qr';
        $data = env('APP_PROTOCOL', 'https').'://' . $card->identifier . '.' . $domain.'?ref=qr';

        $image = \SimpleSoftwareIO\QrCode\Facades\QrCode::format('png');
        
        $image->color(0, 0, 0);
        $image->size(500);

        $image = $image->errorCorrection('H')->generate($data);
        //return response($image)->header('Content-type','image/png');

        $response = new Response();
        $response->setContent($image);
        $response->setStatusCode(200);
        $response->headers->set('Content-Type', 'image/png');
        $response->headers->set('Content-Disposition', 'attachment; filename="'.$card->firstname.'-'.$card->lastname.'-qr.png"');
        //$response->headers->set('Content-Length', mb_strlen($content, 'utf-8'));

        // 5. return the vcard
        return $response;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Card  $card
     * @return \Illuminate\Http\Response
     */
    public function destroy(Card $card)
    {
        $card->identifier = $card->identifier.'-deleted-'.time();
        $card->save();
        $card->delete();
        return response()->json($card);
    }


    public function reviews($place_id){
        if(empty($place_id)) return response()->json('Place not found', 404);

        $lang = !empty($_COOKIE['locale']) ?$_COOKIE['locale']: 'en';

        $result = GoogleReview::where('place_id', $place_id)->first();

        if($result) {
            return response()->json($result->reviews);
        }

        $searchUrl = "https://wextractor.com/api/v1";
        $key  = env("REVIEW_KEY");
        
        $response = Http::get("$searchUrl/reviews", [
            "auth_token" => $key,
            "id" => $place_id,
            "sort" => "highest_rating",
        ])->json();

        if(!empty($response["error"])) {
            return response()->json('Place not found', 404);
        }

        $output = [
            'add' => 'https://search.google.com/local/writereview?placeid=' . $place_id,
            'all' => 'https://search.google.com/local/reviews?placeid=' . $place_id,
            'reviews' => []
        ];

        foreach($response["reviews"] as $review){
            if((int)$review["rating"] < 4) continue;
            
            $output['reviews'][] = [
                'rating' => $review["rating"],
                'text' => $review["text"],
                'author' => $review["reviewer"],
                'avatar' => $review["reviewer_avatar"],
                'link' => $review["reviewer_url"],
                'when' => $review["datetime"],
            ];
        }

        $output['count'] = $response["totals"]["review_count"];
        $output['average'] = $response["totals"]["average_rating"];
        $output['customer'] = $response["place_details"]["name"];

        GoogleReview::create([
            "place_id" => $place_id,
            "reviews" => json_encode($output)
        ]);

        return response()->json($output);

        // $client = new GClient();
        // $response = $client->get('https://maps.googleapis.com/maps/api/place/details/json?placeid='.$place_id.'&key=AIzaSyBqPwb37NpSIzBFeQk5_Q-fl664iSzM_zA&language='.$lang);
        // if($response->getStatusCode() != 200) return response()->json('Place not found', 404);

        // $body = $response->getBody();
        // $json = json_decode($body->getContents());
        
        // if($json->status == 'OK'){
        //     $output = [
        //         'add' => 'https://search.google.com/local/writereview?placeid=' . $place_id,
        //         'all' => 'https://search.google.com/local/reviews?placeid=' . $place_id,
        //         'reviews' => []
        //     ];

        //     foreach($json->result->reviews as $review){
        //         if((int)$review->rating < 4) continue;
                
        //         $output['reviews'][] = [
        //             'rating' => $review->rating,
        //             'text' => $review->text,
        //             'author' => $review->author_name,
        //             'avatar' => $review->profile_photo_url,
        //             'when' => Carbon::parse(date('Y-m-d', $review->time))->locale('de')->diffForHumans(),
        //             'link' => $review->author_url,
        //         ];
        //     }

        //     $output['count'] = $json->result->user_ratings_total;
        //     $output['average'] = $json->result->rating;
        //     $output['customer'] = $json->result->name;

        //     return response()->json($output);
        // }
    }

    public function scrapeReviews($place_id){
        $lang = !empty($_COOKIE['locale']) ?$_COOKIE['locale']: 'en';
        
        // $result = GoogleReview::where('place_id', $place_id)->first();

        // if($result) {
        //     return response()->json($result->reviews);
        // }

        // $pclient = Client::createChromeClient(base_path("drivers/chromedriver"), null, ["port" => 9558]);    // create a chrome client
        
        // $pclient->request('GET', 'https://search.google.com/local/reviews?placeid=' . $place_id.'&hl='.$lang);
           
        // $crawler = $pclient->waitFor('.review-dialog'); 

        // $pclient->executeScript("document.querySelectorAll('.review-more-link').forEach(function(el){el.click()})");

        // $totalReviews = (int)$crawler->filter('.z5jxId')->text();
        
        // $reviews = [];

        // $page = 0;
        // while(true) {
        //     $parentCrawler = $crawler->filter('.Opirzb > .RMCqNd')->eq($page);
            
        //     $parentCrawler->filter('.gws-localreviews__general-reviews-block > .WMbnJf')->each(function (Crawler $childCrawler, $j) use(&$reviews){
        //         $rating = (int) strpbrk($childCrawler->filter('.lTi8oc')->attr('aria-label'), "12345");

        //         if($rating > 3) {
        //             $thumbnail = $childCrawler->filter('.lDY1rd')->attr('src');
        //             $date = $childCrawler->filter('.dehysf')->text();
        //             $name = $childCrawler->filter('.jxjCjc > div > .TSUbDb > a')->text();
        //             $review = $childCrawler->filter('.Jtu6Td')->text();
        
        //             $reviews[] = [
        //                 "avatar" => $thumbnail,
        //                 "author" => $name,
        //                 "when" => $date,
        //                 "rating" => $rating,
        //                 "text" => $review,
        //             ];
        //         }
        //     });

        //     if($totalReviews < 10 || count($reviews) > 9) {
        //         break;
        //     }
            
        //     $pclient->executeScript("document.querySelector('.review-dialog-list').scrollTo(0, document.querySelector('.review-dialog-list').scrollHeight)");
        //     sleep(5); 

        //     $page++;
        // }

        // $output = [
        //     'add' => 'https://search.google.com/local/writereview?placeid=' . $place_id,
        //     'all' => 'https://search.google.com/local/reviews?placeid=' . $place_id,
        //     'count' => $totalReviews,
        //     'average' => $crawler->filter('.Aq14fc')->text(),
        //     'customer' => $crawler->filter('.P5Bobd')->text(),
        //     'reviews' => $reviews
        // ];
        
        // $pclient->quit();

        // GoogleReview::create([
        //     "place_id" => $place_id,
        //     "reviews" => json_encode($output)
        // ]);

        // return response()->json($output);

        // $serp_key = "790d5345cc7b5ad343fd2534adac8456c2bc62e20dbfe0ded87b582a88187151";
        // $serp_search = "https://serpapi.com/search.json";

        // $place = Http::get($serp_search."?engine=google_maps&type=search",[
        //         "engine" => "google_maps",
        //         "type" => "search",
        //         "api_key" => $serp_key,
        //         "place_id" => $place_id
        //     ])->json();
        // if(!empty($place['error'])) return response()->json('Place not found', 404);

        // $data_id = $place['place_results']["data_id"];

        // $response = Http::get($serp_search."?engine=google_maps&type=search",[
        //     "engine" => "google_maps_reviews",
        //     "api_key" => $serp_key,
        //     "data_id" => $data_id,
        //     "sort_by" => "ratingHigh"
        // ])->json();

        // $output = [
        //     'add' => 'https://search.google.com/local/writereview?placeid=' . $place_id,
        //     'all' => 'https://search.google.com/local/reviews?placeid=' . $place_id,
        //     'reviews' => []
        // ];

        // foreach($response["reviews"] as $review){
        //     if((int)$review["rating"] < 4) continue;
            
        //     $output['reviews'][] = [
        //         'rating' => $review["rating"],
        //         'text' => $review["snippet"],
        //         'author' => $review["user"]["name"],
        //         'avatar' => $review["user"]["thumbnail"],
        //         'when' => $review["date"],
        //         'link' => $review["user"]["link"]
        //     ];
        // }

        // $output['count'] = $response["place_info"]["reviews"];
        // $output['average'] = $response["place_info"]["rating"];
        // $output['customer'] = $response["place_info"]["title"];

        // return response()->json($output);

        // $client = new Client();
        // $response = $client->get('https://maps.googleapis.com/maps/api/place/details/json?placeid='.$place_id.'&key=AIzaSyBqPwb37NpSIzBFeQk5_Q-fl664iSzM_zA&language='.$lang);
        // if($response->getStatusCode() != 200) return response()->json('Place not found', 404);

        // $body = $response->getBody();
        // $json = json_decode($body->getContents());
        
        // if($json->status == 'OK'){
        //     $output = [
        //         'add' => 'https://search.google.com/local/writereview?placeid=' . $place_id,
        //         'all' => 'https://search.google.com/local/reviews?placeid=' . $place_id,
        //         'reviews' => []
        //     ];

        //     foreach($json->result->reviews as $review){
        //         if((int)$review->rating < 4) continue;
                
        //         $output['reviews'][] = [
        //             'rating' => $review->rating,
        //             'text' => $review->text,
        //             'author' => $review->author_name,
        //             'avatar' => $review->profile_photo_url,
        //             'when' => Carbon::parse(date('Y-m-d', $review->time))->locale('de')->diffForHumans(),
        //             'link' => $review->author_url,
        //         ];
        //     }

        //     $output['count'] = $json->result->user_ratings_total;
        //     $output['average'] = $json->result->rating;
        //     $output['customer'] = $json->result->name;

        //     return response()->json($output);
        // }

        return response()->json('Place not found', 404);
    }

    public function download(Request $request, $identifier = ''){
        if(empty($identifier) && $request->has('identifier')) $identifier = $request->identifier;
        $card = Card::where('identifier', $identifier)->first();
        if(!$card) return abort(404);

        $vcard = new VCardService($card);
        $content = $vcard->getOutput();

        $response = new Response();
        $response->setContent($content);
        $response->setStatusCode(200);
        $response->headers->set('Content-Type', 'text/x-vcard');
        $response->headers->set('Content-Disposition', 'attachment; filename="'.$card->firstname.'-'.$card->lastname.'.vcf"');
        $response->headers->set('Content-Length', mb_strlen($content, 'utf-8'));

        // 5. return the vcard
        return $response;
    }

}
