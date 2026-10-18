<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('jurusan_id')
                ->nullable()
                ->after('id')
                ->constrained('jurusan')
                ->nullOnDelete();

            $table->string('google_id')
                ->nullable()
                ->unique()
                ->after('email');

            $table->text('avatar')
                ->nullable()
                ->after('google_id');

            $table->string('nim', 20)
                ->nullable()
                ->unique()
                ->after('avatar');

            $table->unsignedSmallInteger('angkatan')
                ->nullable()
                ->after('nim');

            $table->enum('role', ['superadmin', 'admin', 'mahasiswa'])
                ->default('mahasiswa')
                ->after('angkatan');

            $table->boolean('is_active')
                ->default(true)
                ->after('role');

            $table->string('password')
                ->nullable()
                ->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['jurusan_id']);
            $table->dropColumn([
                'jurusan_id',
                'google_id',
                'avatar',
                'nim',
                'angkatan',
                'role',
                'is_active',
            ]);

            $table->string('password')
                ->nullable(false)
                ->change();
        });
    }
};
