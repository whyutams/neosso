<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProgramStudi extends Model
{
    use HasFactory;

    protected $table = 'program_studi';

    protected $fillable = [
        'jurusan_id',
        'nama_prodi',
        'kode_prodi',
        'jenjang',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    // Relasi jurusan
    public function jurusan(): BelongsTo
    {
        return $this->belongsTo(Jurusan::class, 'jurusan_id');
    }

    // Relasi pengguna di prodi ini
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'program_studi_id');
    }

    // Relasi mahasiswa di prodi ini
    public function mahasiswa(): HasMany
    {
        return $this->hasMany(User::class, 'program_studi_id')->where('role', 'mahasiswa');
    }
}
