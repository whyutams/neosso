<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Ubah role admin_prodi yang ada menjadi admin
        DB::table('users')->where('role', 'admin_prodi')->update(['role' => 'admin']);

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('superadmin', 'admin', 'mahasiswa') NOT NULL DEFAULT 'mahasiswa'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('superadmin', 'admin', 'mahasiswa') NOT NULL DEFAULT 'mahasiswa'");
        }
    }
};
