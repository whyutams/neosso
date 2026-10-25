<?php

use App\Http\Controllers\Admin\JurusanController;
use App\Http\Controllers\Admin\LayananController;
use App\Http\Controllers\Admin\ProgramStudiController;
use App\Http\Controllers\Admin\SsoClientController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\ProfileController;
use App\Models\AuthLog;
use App\Models\Jurusan;
use App\Models\Layanan;
use App\Models\User;
use Carbon\Carbon;
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

    // Query dasar log aktivitas
    $baseLogQuery = AuthLog::query();
    if ($user->isAdmin() && $user->jurusan_id) {
        $baseLogQuery->whereHas('user', function ($q) use ($user) {
            $q->where('jurusan_id', $user->jurusan_id);
        });
    }

    $dayNames = [
        'Monday' => 'Senin',
        'Tuesday' => 'Selasa',
        'Wednesday' => 'Rabu',
        'Thursday' => 'Kamis',
        'Friday' => 'Jumat',
        'Saturday' => 'Sabtu',
        'Sunday' => 'Minggu',
    ];

    // Data mingguan (Senin s/d Minggu minggu berjalan)
    $startOfWeek = Carbon::now()->startOfWeek(Carbon::MONDAY);
    $weeklyPoints = [];
    for ($i = 0; $i < 7; $i++) {
        $date = $startOfWeek->copy()->addDays($i);
        $count = (clone $baseLogQuery)->whereDate('created_at', $date->toDateString())->count();
        $weeklyPoints[] = [
            'label' => $dayNames[$date->format('l')] ?? $date->format('D'),
            'count' => $count,
        ];
    }
    $weeklyTotal = array_sum(array_column($weeklyPoints, 'count'));
    $weeklyAvg = round($weeklyTotal / 7);

    // Data bulanan (5 minggu ke belakang hingga minggu ini)
    $monthlyPoints = [];
    $startOfMonthly = Carbon::now()->startOfWeek(Carbon::MONDAY)->subWeeks(4);
    for ($i = 0; $i < 5; $i++) {
        $weekStart = $startOfMonthly->copy()->addWeeks($i);
        $weekEnd = $weekStart->copy()->endOfWeek(Carbon::SUNDAY);
        $count = (clone $baseLogQuery)
            ->whereBetween('created_at', [$weekStart->startOfDay(), $weekEnd->endOfDay()])
            ->count();
        $monthlyPoints[] = [
            'label' => 'Mgg ' . ($i + 1),
            'count' => $count,
        ];
    }
    $monthlyTotal = array_sum(array_column($monthlyPoints, 'count'));
    $monthlyAvg = round($monthlyTotal / 5);

    $todayCount = (clone $baseLogQuery)->whereDate('created_at', Carbon::today()->toDateString())->count();

    $activityStats = [
        'weekly' => [
            'points' => $weeklyPoints,
            'total' => number_format($weeklyTotal, 0, ',', '.'),
            'avg' => number_format($weeklyAvg, 0, ',', '.'),
            'today' => number_format($todayCount, 0, ',', '.'),
        ],
        'monthly' => [
            'points' => $monthlyPoints,
            'total' => number_format($monthlyTotal, 0, ',', '.'),
            'avg' => number_format($monthlyAvg, 0, ',', '.'),
            'today' => number_format($todayCount, 0, ',', '.'),
        ],
    ];

    return Inertia::render('Dashboard', [
        'activityStats' => $activityStats,
        'layanan' => Inertia::defer(function () use ($user) {
            $layananQuery = Layanan::with(['ssoClient', 'jurusan', 'programStudi'])
                ->where('is_active', true)
                ->orderBy('urutan', 'asc')
                ->orderBy('id', 'asc');

            if ($user->isAdminProdi()) {
                $layananQuery->where('program_studi_id', $user->program_studi_id);
            } elseif ($user->isAdmin()) {
                $layananQuery->where('jurusan_id', $user->jurusan_id);
            } elseif ($user->role === 'mahasiswa') {
                $layananQuery->where(function ($q) use ($user) {
                    $q->whereNull('jurusan_id')
                        ->orWhere(function ($sub) use ($user) {
                            $sub->where('jurusan_id', $user->jurusan_id)
                                ->where(function ($p) use ($user) {
                                    $p->whereNull('program_studi_id')
                                        ->orWhere('program_studi_id', $user->program_studi_id);
                                });
                        });
                });
            }

            return $layananQuery->get();
        }),
        'stats' => [
            'total_layanan' => $user->isSuperAdmin()
                ? Layanan::where('is_active', true)->count()
                : ($user->isAdminProdi()
                    ? Layanan::where('program_studi_id', $user->program_studi_id)->where('is_active', true)->count()
                    : ($user->isAdmin()
                        ? Layanan::where('jurusan_id', $user->jurusan_id)->where('is_active', true)->count()
                        : Layanan::where('is_active', true)->where(function ($q) use ($user) {
                            $q->whereNull('jurusan_id')
                                ->orWhere(function ($sub) use ($user) {
                                    $sub->where('jurusan_id', $user->jurusan_id)
                                        ->where(function ($p) use ($user) {
                                            $p->whereNull('program_studi_id')
                                                ->orWhere('program_studi_id', $user->program_studi_id);
                                        });
                                });
                        })->count())),
            'total_pengguna' => $user->isSuperAdmin() ? User::where('is_active', true)->count() : 0,
            'total_jurusan' => $user->isSuperAdmin() ? Jurusan::where('is_active', true)->count() : 0,
            'total_prodi' => $user->isSuperAdmin()
                ? \App\Models\ProgramStudi::where('is_active', true)->count()
                : ($user->jurusan_id
                    ? \App\Models\ProgramStudi::where('jurusan_id', $user->jurusan_id)->where('is_active', true)->count()
                    : 0),
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
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
