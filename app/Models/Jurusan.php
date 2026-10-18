<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Jurusan extends Model
{
    use HasFactory;

    /**
     * Nama tabel di database.
     *
     * @var string
     */
    protected $table = 'jurusan';

    /**
     * Atribut yang dapat diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nama_jurusan',
        'is_active',
    ];

    /**
     * Konversi tipe data atribut.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * Seluruh pengguna (admin dan mahasiswa) yang bernaung di bawah jurusan ini.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'jurusan_id');
    }

    /**
     * Seluruh administrator yang mengelola jurusan ini.
     */
    public function admins(): HasMany
    {
        return $this->hasMany(User::class, 'jurusan_id')->where('role', 'admin');
    }

    /**
     * Seluruh mahasiswa di bawah jurusan ini.
     */
    public function mahasiswa(): HasMany
    {
        return $this->hasMany(User::class, 'jurusan_id')->where('role', 'mahasiswa');
    }
}
