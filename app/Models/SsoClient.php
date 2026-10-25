<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SsoClient extends Model
{
    use HasFactory;

    protected $table = 'sso_clients';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'layanan_id',
        'client_id',
        'client_secret',
        'redirect_uri',
        'is_active',
        'created_by',
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

    // Relasi layanan
    public function layanan(): BelongsTo
    {
        return $this->belongsTo(Layanan::class, 'layanan_id');
    }

    // Relasi user pembuat
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Daftar URI callback redirect yang diizinkan
    public function getAllowedRedirectUris(): array
    {
        return array_values(array_filter(
            array_map('trim', preg_split('/[\r\n,]+/', $this->redirect_uri ?? ''))
        ));
    }
}
