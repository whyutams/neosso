<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirectResponse;

class GoogleAuthController extends Controller
{
    public function redirect(): SymfonyRedirectResponse|RedirectResponse
    {
        return Socialite::driver('google')
            ->with([
                'prompt' => 'select_account',
                'hd' => 'ung.ac.id',
            ])
            ->redirect();
    }

    public function callback(): RedirectResponse
    {
        return redirect()->route('login')->with('status', 'Callback Google berhasil dihubungi.');
    }
}
