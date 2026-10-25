<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            JurusanSeeder::class,
            ProgramStudiSeeder::class,
            AdminUserSeeder::class,
            LayananSeeder::class,
            SsoClientSeeder::class,
        ]);
    }
}
