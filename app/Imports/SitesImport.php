<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use App\Models\User;
use App\Models\Card;
use App\Models\CardCover;
use App\Models\CardService;
use App\Models\CardProject;
use App\Models\CardDocument;
use App\Models\CardGallery;
use App\Models\CardCustomCode;
use App\Models\Plan;
use App\Models\EnterpriseSettingDetail;
use Illuminate\Support\Facades\DB;

class SitesImport implements ToCollection, WithValidation, WithHeadingRow, SkipsOnFailure
{
    use SkipsFailures;

    public $records;
    public $unsuccessful;

    public function __construct($company_id)
    {
        $this->company_id = $company_id;
    }

    public function startRow(): int
    {
        return 2;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
        ];
    }

    /**
     * @param Failure[] $failures
     */
    // public function onFailure(Failure ...$failures)
    // {
    //     die(var_dump($failures));
    // }

    /**
    * @param Collection $collection
    */
    public function collection(Collection $rows)
    {
        $i = 0;
        foreach ($rows as $row) {
            $firstname = $row['first_name'];
            $lastname = $row['last_name'];
            $company = $row['company_name'];
            $jobTitle = $row['job_title'];
            $phone = $row['office_number'];
            $mobile = $row['mobile_number'];
            $email = $row['email'];
            $address = $row['adresse'];
            $facebook = $row['facebook'];
            $linkedin = $row['linkedin'];
            $whatsapp = $row['whatsapp'];

            $this->records[] = [
                "first_name" => $firstname,
                "last_name" => $lastname,
                "company_name" => $company,
                "job_title" => $jobTitle,
                "office_number" => $phone,
                "mobile_number" => $mobile,
                "email" => $email,
                "adresse" => $address,
                "facebook" => $facebook,
                "linkedin" => $linkedin,
                "whatsapp" => $whatsapp,
            ];

            $product = Plan::where('slug', 'enterprise')->first();

            $token = uniqid(rand(), true).time();

            $user = new User();
            $user->name = "$firstname $lastname";
            $user->email = $email;
            $user->password = $token;
            $user->product = $product->id;

            $g = ['WeShare Member'];
            $groups = DB::connection('backoffice')->table('contactgroups')->whereIn('name', $g)->get();
            $branch = DB::connection('backoffice')->table('contacts')->where('branch', 1)->where('archive', 0)->first();

            $contact = DB::connection('backoffice')->table('contacts')->where('email', $user->email)->first();
            if (!$contact) {
                $user->enterprise_id = $this->company_id;
                $user->contact = DB::connection('backoffice')->table('contacts')->insertGetId([
                    'email' => $user->email,
                    'password' => $user->password,
                    'invoice_email' => $user->email,
                    'firstname' => $firstname,
                    'lastname' => $lastname,
                    'company' => $company ?? '',
                    'address' => $address ?? '',
                    'telephone' => $phone ?? '',
                    'cellphone' => $mobile ?? '',
                    'active' => 1,
                    'buid' => $branch ? $branch->uid : 0,
                    'customer' => 1,
                    'registered' => date('Y-m-d H:i:s'),
                ]);
                foreach ($groups as $group) {
                    DB::connection('backoffice')->table('con_group')->insert([
                        'groupuid' => $group->uid,
                        'cuid' => $user->contact,
                    ]);
                }

                DB::connection('backoffice')->table('c2c')->insert([
                    'cuid' => $this->company_id,
                    'cuid2' => $user->contact,
                ]);
            } else {
                $user->contact = $contact->uid;
                $user->enterprise_id = $this->company_id;

                DB::connection('backoffice')->table('c2c')->insert([
                    'cuid' => $this->company_id,
                    'cuid2' => $user->contact,
                ]);

                foreach ($groups as $group) {
                    DB::connection('backoffice')->table('con_group')->insert([
                        'groupuid' => $group->uid,
                        'cuid' => $user->contact,
                    ]);
                }
            }

            $identifier = strtolower(preg_replace('/[^a-zA-Z0-9.]+/', '-', $firstname.'-'.$lastname));
            if(Card::where('identifier', $identifier)->exists()){
                $identifier .= '-'.rand(10,99);
            }

            $user->saveQuietly();

            $cover = CardCover::find(1);

            $card = new Card();
            $card->user_id = $user->id;
            $card->identifier = $identifier;
            $card->primary = true;
            $card->cover = $cover->url;
            $card->firstname = $firstname;
            $card->lastname = $lastname;
            $card->job = $jobTitle;
            $card->email = $email;

            if(!empty($company)) $card->company = $company;
            if(!empty($phone)) $card->phone = $phone;
            if(!empty($email)) $card->mobile = $mobile;
            if(!empty($address)) $card->address = $address;

            $card->save();

            $settingDetails = EnterpriseSettingDetail::where('enterprise_id', $user->enterprise_id)->first();
            if($settingDetails) {
                $card->avatar = $settingDetails->avatar;
                $card->logo = $settingDetails->logo;
                $card->cover = $settingDetails->cover->src;
                $card->cover_thumbnail = $settingDetails->cover->thumbnail;
                $card->cover_type = $settingDetails->cover->type;
                $card->settings = json_encode($settingDetails->settings);

                $socials = $settingDetails->socials;
                if(!empty($facebook)) $socials->facebook = $facebook;
                if(!empty($linkedin)) $socials->linkedin = $linkedin;
                if(!empty($facebook)) $socials->whatsapp = $whatsapp;
                $card->socials = json_encode($socials);

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

            $i++;
        }
   }
}
