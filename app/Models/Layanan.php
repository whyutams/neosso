<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Layanan extends Model
{
    use HasFactory;

    protected $table = 'layanan';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'jurusan_id',
        'program_studi_id',
        'nama_layanan',
        'slug',
        'deskripsi',
        'icon_url',
        'url',
        'tipe_integrasi',
        'is_active',
        'urutan',
        'created_by',
        'updated_by',
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
            'urutan' => 'integer',
        ];
    }

    // Relasi jurusan
    public function jurusan(): BelongsTo
    {
        return $this->belongsTo(Jurusan::class, 'jurusan_id');
    }

    // Relasi program studi
    public function programStudi(): BelongsTo
    {
        return $this->belongsTo(ProgramStudi::class, 'program_studi_id');
    }

    // Relasi hak akses layanan
    public function aksesLayanan(): HasMany
    {
        return $this->hasMany(AksesLayanan::class, 'layanan_id');
    }

    // Relasi klien SSO
    public function ssoClient(): HasOne
    {
        return $this->hasOne(SsoClient::class, 'layanan_id');
    }

    // Relasi user pembuat
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Relasi user pengubah
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Cek apakah integrasi tipe SSO
    public function isSso(): bool
    {
        return $this->tipe_integrasi === 'sso';
    }

    // Gunakan slug untuk route model binding
    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
