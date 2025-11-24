<?php

namespace Database\Seeders;

use App\Models\CardCover;
use App\Models\Translation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // \App\Models\User::factory(10)->create();

        CardCover::truncate();
        $directory = public_path('/assets/covers');
        if(is_dir($directory)){
            $files = scandir($directory);
            foreach($files as $file){
                if(in_array($file, ['.', '..'])) continue;
                $cover = new CardCover();
                $cover->url = asset('/assets/covers/'.$file);
                $cover->save();
            }
        }
        // $translations = DB::connection('backoffice')->table('vlink_translations')->get();
        // foreach($translations as $translation){
        //     $entry = new Translation();
        //     $entry->default = $translation->default;
        //     $entry->translation = $translation->translation;
        //     $entry->save();
        // }
    }
}
