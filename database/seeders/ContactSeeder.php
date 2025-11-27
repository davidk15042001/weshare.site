<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Contact;

class ContactSeeder extends Seeder
{
    public function run(): void
    {
        Contact::firstOrCreate(
            ['email' => 'branch@weshare.com'],
            [
                'password' => bcrypt('password'),
                'invoice_email' => 'branch@weshare.com',
                'active' => 1,
                'buid' => 1,
                'customer' => 0,
                'branch' => 1,
                'archive' => 0,
                'registered' => now(),
            ]
        );
    }
}
