<?php

namespace Database\Seeders;

use App\Models\Layanan;
use App\Models\SsoClient;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SsoClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        $layananSkripsi = Layanan::where('slug', 'pengajuan-judul-skripsi')->first();
        if ($layananSkripsi) {
            SsoClient::updateOrCreate(
                ['layanan_id' => $layananSkripsi->id],
                [
                    'client_id' => 'client_skripsi_informatika',
                    'client_secret' => Hash::make('secret_skripsi_inf_2026'),
                    'redirect_uri' => "http://localhost:8001/auth/callback\nhttp://127.0.0.1:8001/auth/callback",
                    'is_active' => true,
                    'created_by' => $admin?->id,
                ]
            );
        }

        $layananBebasLab = Layanan::where('slug', 'bebas-laboratorium')->first();
        if ($layananBebasLab) {
            SsoClient::updateOrCreate(
                ['layanan_id' => $layananBebasLab->id],
                [
                    'client_id' => 'client_bebaslab_informatika',
                    'client_secret' => Hash::make('secret_bebaslab_inf_2026'),
                    'redirect_uri' => "http://localhost:8002/auth/callback\nhttp://127.0.0.1:8002/auth/callback",
                    'is_active' => true,
                    'created_by' => $admin?->id,
                ]
            );
        }
    }
}
