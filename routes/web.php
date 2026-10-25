<?php

use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\JurusanController;
use App\Http\Controllers\Admin\LayananController;
use App\Http\Controllers\Admin\ProgramStudiController;
use App\Http\Controllers\Admin\SsoClientController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\ProfileController;
use App\Models\Jurusan;
use App\Models\Layanan;
use App\Models\User;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function (Request $request) {
    $user = $request->user();

    return Inertia::render('Dashboard', [
        'layanan' => Inertia::defer(function () use ($user) {
            $layananQuery = Layanan::with(['ssoClient', 'jurusan'])
                ->where('is_active', true)
                ->orderBy('urutan', 'asc')
                ->orderBy('id', 'asc');

            if ($user->jurusan_id) {
                $layananQuery->where('jurusan_id', $user->jurusan_id);
            }

            return $layananQuery->get();
        }),
        'stats' => [
            'total_layanan' => Layanan::where('is_active', true)->count(),
            'total_pengguna' => User::where('is_active', true)->count(),
            'total_jurusan' => Jurusan::where('is_active', true)->count(),
            'total_prodi' => \App\Models\ProgramStudi::where('is_active', true)->count(),
        ],
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/search/layanan-preview', [LayananController::class, 'searchPreview'])
    ->middleware(['auth', 'verified'])
    ->name('layanan.search-preview');

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    // Layanan
    Route::get('/layanan', [LayananController::class, 'index'])->name('layanan.index');
    Route::get('/layanan/create', [LayananController::class, 'create'])->name('layanan.create');
    Route::post('/layanan', [LayananController::class, 'store'])->name('layanan.store');
    Route::post('/layanan/detect-icon', [LayananController::class, 'detectIcon'])->name('layanan.detect-icon');
    Route::get('/layanan/{layanan:slug}/edit', [LayananController::class, 'edit'])->name('layanan.edit');
    Route::put('/layanan/{layanan:slug}', [LayananController::class, 'update'])->name('layanan.update');
    Route::delete('/layanan/{layanan:slug}', [LayananController::class, 'destroy'])->name('layanan.destroy');
    Route::patch('/layanan/{layanan:slug}/toggle', [LayananController::class, 'toggleStatus'])->name('layanan.toggle');

    // Jurusan
    Route::get('/jurusan', [JurusanController::class, 'index'])->name('jurusan.index');
    Route::get('/jurusan/create', [JurusanController::class, 'create'])->name('jurusan.create');
    Route::post('/jurusan', [JurusanController::class, 'store'])->name('jurusan.store');
    Route::get('/jurusan/{jurusan}/edit', [JurusanController::class, 'edit'])->name('jurusan.edit');
    Route::put('/jurusan/{jurusan}', [JurusanController::class, 'update'])->name('jurusan.update');
    Route::delete('/jurusan/{jurusan}', [JurusanController::class, 'destroy'])->name('jurusan.destroy');
    Route::patch('/jurusan/{jurusan}/toggle', [JurusanController::class, 'toggleStatus'])->name('jurusan.toggle');

    // Program Studi
    Route::get('/program-studi', [ProgramStudiController::class, 'index'])->name('program-studi.index');
    Route::get('/program-studi/create', [ProgramStudiController::class, 'create'])->name('program-studi.create');
    Route::post('/program-studi', [ProgramStudiController::class, 'store'])->name('program-studi.store');
    Route::get('/program-studi/{programStudi}/edit', [ProgramStudiController::class, 'edit'])->name('program-studi.edit');
    Route::put('/program-studi/{programStudi}', [ProgramStudiController::class, 'update'])->name('program-studi.update');
    Route::delete('/program-studi/{programStudi}', [ProgramStudiController::class, 'destroy'])->name('program-studi.destroy');
    Route::patch('/program-studi/{programStudi}/toggle', [ProgramStudiController::class, 'toggleStatus'])->name('program-studi.toggle');

    // Pengguna & Admin
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    Route::patch('/users/{user}/toggle', [UserController::class, 'toggleStatus'])->name('users.toggle');

    // Klien SSO
    Route::get('/sso-clients', [SsoClientController::class, 'index'])->name('sso-clients.index');
    Route::get('/sso-clients/create', [SsoClientController::class, 'create'])->name('sso-clients.create');
    Route::post('/sso-clients', [SsoClientController::class, 'store'])->name('sso-clients.store');
    Route::get('/sso-clients/{ssoClient}/edit', [SsoClientController::class, 'edit'])->name('sso-clients.edit');
    Route::put('/sso-clients/{ssoClient}', [SsoClientController::class, 'update'])->name('sso-clients.update');
    Route::delete('/sso-clients/{ssoClient}', [SsoClientController::class, 'destroy'])->name('sso-clients.destroy');
    Route::patch('/sso-clients/{ssoClient}/toggle', [SsoClientController::class, 'toggleStatus'])->name('sso-clients.toggle');
    Route::post('/sso-clients/{ssoClient}/secret', [SsoClientController::class, 'regenerateSecret'])->name('sso-clients.secret');

    // Audit Log
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
