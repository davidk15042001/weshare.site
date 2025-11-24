<?php

namespace App\Console\Commands;

use App\Models\Translation;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CreateTranslationFiles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'translation:generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create translation file';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {

        $translations = [];
        $rows = Translation::all();
        // dd($rows);
        foreach($rows as $row){
            $translations[$row->default] = json_decode($row->translation);
        }
        // dd($translations);
        if(file_exists(storage_path('/app/translations.json'))){
            unlink(storage_path('/app/translations.json'));
        }
        file_put_contents(storage_path('/app/translations.json'), json_encode($translations));
        Log::info('Translation files generated...');
    }
}
