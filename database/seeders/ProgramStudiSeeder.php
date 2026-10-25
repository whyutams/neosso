<?php

namespace Database\Seeders;

use App\Models\Jurusan;
use App\Models\ProgramStudi;
use Illuminate\Database\Seeder;

class ProgramStudiSeeder extends Seeder
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

        $daftarProdi = [
            [
                'nama_prodi' => 'Teknik Informatika',
                'kode_prodi' => '5314',
                'jenjang' => 'S1',
                'is_active' => true,
            ],
            [
                'nama_prodi' => 'Sistem Informasi',
                'kode_prodi' => '5324',
                'jenjang' => 'S1',
                'is_active' => true,
            ],
            [
                'nama_prodi' => 'Pendidikan Teknologi Informasi',
                'kode_prodi' => '5315',
                'jenjang' => 'S1',
                'is_active' => true,
            ],
        ];

        foreach ($daftarProdi as $item) {
            ProgramStudi::updateOrCreate(
                [
                    'jurusan_id' => $jurusan->id,
                    'nama_prodi' => $item['nama_prodi'],
                ],
                $item
            );
        }
    }
}
