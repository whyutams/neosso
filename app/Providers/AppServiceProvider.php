<?php

namespace App\Providers;

use App\Listeners\LogAuthenticationEvents;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Paksa HTTPS di production
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

        // Kebijakan password default
        Password::defaults(function () {
            $rule = Password::min(12);

            return $this->app->isProduction()
                ? $rule->letters()->mixedCase()->numbers()->symbols()->uncompromised()
                : $rule->letters()->numbers();
        });

        // Listener log autentikasi
        Event::subscribe(LogAuthenticationEvents::class);
    }
}
