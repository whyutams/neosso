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
        Schema::create('sso_clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('layanan_id')->unique()->constrained('layanan')->cascadeOnDelete();
            $table->string('client_id', 100)->unique();
            $table->string('client_secret');
            $table->text('redirect_uri');
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sso_clients');
    }
};
