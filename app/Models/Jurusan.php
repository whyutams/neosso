<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Jurusan extends Model
{
    use HasFactory;

    protected $table = 'jurusan';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nama_jurusan',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    // Relasi user di jurusan ini
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'jurusan_id');
    }

    // Relasi admin jurusan
    public function admins(): HasMany
    {
        return $this->hasMany(User::class, 'jurusan_id')->where('role', 'admin');
    }

    // Relasi mahasiswa jurusan
    public function mahasiswa(): HasMany
    {
        return $this->hasMany(User::class, 'jurusan_id')->where('role', 'mahasiswa');
    }

    // Relasi layanan milik jurusan
    public function layanan(): HasMany
    {
        return $this->hasMany(Layanan::class, 'jurusan_id');
    }

    // Relasi program studi di jurusan ini
    public function programStudi(): HasMany
    {
        return $this->hasMany(ProgramStudi::class, 'jurusan_id');
    }
}
