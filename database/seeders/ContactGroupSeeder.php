<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ContactGroup;

class ContactGroupSeeder extends Seeder
{
    public function run(): void
    {
        $groups = [
            'WeShare Member',
            'WeShare Customer',
        ];

        foreach ($groups as $group) {
            ContactGroup::firstOrCreate(['name' => $group]);
        }
    }
}
