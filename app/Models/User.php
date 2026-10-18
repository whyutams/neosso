<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Atribut yang dapat diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'jurusan_id',
        'name',
        'email',
        'google_id',
        'avatar',
        'nim',
        'angkatan',
        'role',
        'is_active',
        'password',
    ];

    /**
     * Atribut yang disembunyikan saat serialisasi.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Konversi tipe data atribut.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'angkatan' => 'integer',
        ];
    }

    /**
     * Relasi ke jurusan tempat pengguna bernaung (khusus admin & mahasiswa).
     */
    public function jurusan(): BelongsTo
    {
        return $this->belongsTo(Jurusan::class, 'jurusan_id');
    }

    /**
     * Memeriksa apakah pengguna memiliki peran superadmin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'superadmin';
    }

    /**
     * Memeriksa apakah pengguna memiliki peran admin jurusan.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Memeriksa apakah pengguna memiliki akses administratif (superadmin atau admin jurusan).
     */
    public function hasAdminAccess(): bool
    {
        return in_array($this->role, ['superadmin', 'admin'], true);
    }

    /**
     * Memeriksa apakah pengguna memiliki peran mahasiswa.
     */
    public function isMahasiswa(): bool
    {
        return $this->role === 'mahasiswa';
    }

    /**
     * Memeriksa apakah pengguna berhak mengelola jurusan tertentu.
     */
    public function canManageJurusan(?int $jurusanId): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return $this->isAdmin() && $this->jurusan_id === $jurusanId;
    }
}
