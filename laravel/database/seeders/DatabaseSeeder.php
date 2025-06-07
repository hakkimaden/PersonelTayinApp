<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create(); // Varsayılan kullanıcı seed'i

        $this->call([
            AdliyeSeeder::class,
        ]);

         User::factory()->create([
             'name' => 'Hakkı Maden',
             'sicil' => '221694',
             'password' => bcrypt('221694'), // Şifreyi bcrypt ile hash'leyin
             'mevcut_adliye_id' => 42,
             'telefon' => '0545 629 7673',
         ]);
    }
}
