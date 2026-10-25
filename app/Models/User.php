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
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'jurusan_id',
        'program_studi_id',
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
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
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

    // Cek superadmin
    public function isSuperAdmin(): bool
    {
        return $this->role === 'superadmin';
    }

    // Cek admin jurusan
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    // Role admin_prodi sudah dihapus (selalu return false untuk keamanan)
    public function isAdminProdi(): bool
    {
        return false;
    }

    // Cek hak akses admin
    public function hasAdminAccess(): bool
    {
        return in_array($this->role, ['superadmin', 'admin'], true);
    }

    // Cek mahasiswa
    public function isMahasiswa(): bool
    {
        return $this->role === 'mahasiswa';
    }

    // Cek hak kelola jurusan
    public function canManageJurusan(?int $jurusanId): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        if ($this->isAdmin() && $this->jurusan_id === $jurusanId) {
            return true;
        }

        return false;
    }

    // Cek hak kelola program studi
    public function canManageProdi(?int $prodiId, ?int $prodiJurusanId = null): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        if ($this->isAdmin() && $prodiJurusanId !== null && $this->jurusan_id === $prodiJurusanId) {
            return true;
        }

        return false;
    }
}
