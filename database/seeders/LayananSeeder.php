<?php

namespace Database\Seeders;

use App\Models\AksesLayanan;
use App\Models\Jurusan;
use App\Models\Layanan;
use App\Models\User;
use Illuminate\Database\Seeder;

class LayananSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jurusan = Jurusan::where('nama_jurusan', 'Informatika')->first();
        if (! $jurusan) {
            return;
        }

        $admin = User::where('role', 'admin')->first();

        $daftarLayanan = [
            [
                'nama_layanan' => 'Sistem Pengajuan Judul Skripsi Informatika',
                'slug' => 'pengajuan-judul-skripsi',
                'deskripsi' => 'Layanan pengajuan topik, judul skripsi, dan penentuan dosen pembimbing mahasiswa Jurusan Informatika.',
                'url' => 'http://localhost:8001/auth/callback',
                'tipe_integrasi' => 'sso',
                'is_active' => true,
                'urutan' => 1,
            ],
            [
                'nama_layanan' => 'Sistem Bebas Laboratorium Komputer',
                'slug' => 'bebas-laboratorium',
                'deskripsi' => 'Layanan pengurusan surat bebas tanggungan laboratorium komputer untuk syarat yudisium mahasiswa Jurusan Informatika.',
                'url' => 'http://localhost:8002/auth/callback',
                'tipe_integrasi' => 'sso',
                'is_active' => true,
                'urutan' => 2,
            ],
            [
                'nama_layanan' => 'Sistem Informasi Akademik Terpadu (SIAT UNG)',
                'slug' => 'siat-ung',
                'deskripsi' => 'Portal pengisian KRS, kartu hasil studi, dan tagihan UKT resmi Universitas Negeri Gorontalo.',
                'url' => 'https://siat.ung.ac.id',
                'tipe_integrasi' => 'link_eksternal',
                'is_active' => true,
                'urutan' => 3,
            ],
            [
                'nama_layanan' => 'Sistem Pembelajaran Daring (SPADA UNG)',
                'slug' => 'spada-ung',
                'deskripsi' => 'Platform perkuliahan daring, materi kuliah, penugasan, dan kuis online terintegrasi UNG.',
                'url' => 'https://spada.ung.ac.id',
                'tipe_integrasi' => 'link_eksternal',
                'is_active' => true,
                'urutan' => 4,
            ],
        ];

        foreach ($daftarLayanan as $data) {
            $layanan = Layanan::updateOrCreate(
                ['slug' => $data['slug']],
                array_merge($data, [
                    'jurusan_id' => $jurusan->id,
                    'created_by' => $admin?->id,
                    'updated_by' => $admin?->id,
                ])
            );

            AksesLayanan::firstOrCreate([
                'layanan_id' => $layanan->id,
                'role' => 'mahasiswa',
                'jurusan_id' => $jurusan->id,
            ]);

            AksesLayanan::firstOrCreate([
                'layanan_id' => $layanan->id,
                'role' => 'admin',
                'jurusan_id' => $jurusan->id,
            ]);
        }
    }
}
