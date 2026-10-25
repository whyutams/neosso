<?php

namespace Database\Seeders;

use App\Models\Jurusan;
use Illuminate\Database\Seeder;

class JurusanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Jurusan::firstOrCreate(
            ['nama_jurusan' => 'Informatika'],
            ['is_active' => true]
        );
    }
}
