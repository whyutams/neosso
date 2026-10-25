<?php

namespace Database\Seeders;

use App\Models\Jurusan;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'superadmin@ung.ac.id'],
            [
                'name' => 'Super Admin',
                'jurusan_id' => null,
                'google_id' => null,
                'avatar' => null,
                'nim' => null,
                'angkatan' => null,
                'role' => 'superadmin',
                'is_active' => true,
                'email_verified_at' => now(),
                'password' => Hash::make('SuperAdmin#2026'),
            ]
        );

        $jurusanInformatika = Jurusan::where('nama_jurusan', 'Informatika')->first();

        if ($jurusanInformatika) {
            User::firstOrCreate(
                ['email' => 'admin.informatika@ung.ac.id'],
                [
                    'name' => 'Admin Informatika',
                    'jurusan_id' => $jurusanInformatika->id,
                    'google_id' => null,
                    'avatar' => null,
                    'nim' => null,
                    'angkatan' => null,
                    'role' => 'admin',
                    'is_active' => true,
                    'email_verified_at' => now(),
                    'password' => Hash::make('AdminInformatika#2026'),
                ]
            );
        }
    }
}
