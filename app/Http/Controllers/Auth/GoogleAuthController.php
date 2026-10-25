<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirectResponse;
use Throwable;

class GoogleAuthController extends Controller
{
    public function redirect(): SymfonyRedirectResponse|RedirectResponse
    {
        return Socialite::driver('google')
            ->with([
                'hd' => 'ung.ac.id',
            ])
            ->redirect();
    }

    public function callback(): RedirectResponse
    {
        try {
            /** @var \Laravel\Socialite\Two\User $googleUser */
            $googleUser = Socialite::driver('google')->user();
        } catch (Throwable $e) {
            return redirect()->route('login')->withErrors([
                'email' => 'Gagal melakukan otentikasi dengan Google: ' . $e->getMessage(),
            ]);
        }

        $email = strtolower((string) $googleUser->getEmail());

        if (!str_ends_with($email, 'ung.ac.id')) {
            return redirect()->route('login')->withErrors([
                'email' => 'Hanya akun Google resmi Universitas Negeri Gorontalo (@ung.ac.id) yang diizinkan masuk.',
            ]);
        }

        $user = User::where('google_id', $googleUser->getId())
            ->orWhere('email', $email)
            ->first();

        $username = explode('@', $email)[0];
        $detectedNim = null;
        $detectedAngkatan = null;
        $detectedProdiId = null;
        $detectedJurusanId = null;

        if (preg_match('/(\d{9,10})/', $username, $matches)) {
            $detectedNim = $matches[1];
            $kodeProdi = substr($detectedNim, 0, 4);
            $twoDigitYear = substr($detectedNim, 4, 2);
            if (is_numeric($twoDigitYear)) {
                $detectedAngkatan = (int) ('20'.$twoDigitYear);
            }
            $matchedProdi = \App\Models\ProgramStudi::where('kode_prodi', $kodeProdi)->first();
            if ($matchedProdi) {
                $detectedProdiId = $matchedProdi->id;
                $detectedJurusanId = $matchedProdi->jurusan_id;
            }
        }

        if ($user) {
            if (!$user->is_active) {
                return redirect()->route('login')->withErrors([
                    'email' => 'Akun Anda dinonaktifkan oleh administrator. Silakan hubungi pengelola sistem.',
                ]);
            }

            $user->update([
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar() ?? $user->avatar,
                'email_verified_at' => $user->email_verified_at ?? now(),
                'program_studi_id' => $user->program_studi_id ?? $detectedProdiId,
                'jurusan_id' => $user->jurusan_id ?? $detectedJurusanId,
                'nim' => $user->nim ?? $detectedNim,
                'angkatan' => $user->angkatan ?? $detectedAngkatan,
            ]);
        } else {
            $user = User::create([
                'name' => $googleUser->getName() ?: $username,
                'email' => $email,
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'program_studi_id' => $detectedProdiId,
                'jurusan_id' => $detectedJurusanId,
                'nim' => $detectedNim,
                'angkatan' => $detectedAngkatan,
                'role' => 'mahasiswa',
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
        }

        Auth::login($user, true);
        request()->session()->regenerate();

        \App\Models\AuthLog::create([
            'user_id' => $user->id,
            'event' => 'login',
            'email' => $user->email,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'status' => 'success',
            'message' => 'Login berhasil via Google SSO',
            'created_at' => now(),
        ]);

        return redirect()->intended(route('dashboard', absolute: false));
    }
}

