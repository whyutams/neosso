<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Events\Dispatcher;
use Illuminate\Support\Facades\Log;

class LogAuthenticationEvents
{
    /**
     * Handle user login event.
     */
    public function handleUserLogin(Login $event): void
    {
        $ip = request()->ip();
        $userAgent = request()->userAgent();
        $userId = $event->user->getAuthIdentifier();
        $email = $event->user->email ?? 'N/A';

        Log::info("[SECURITY AUDIT] Login Success - User ID: {$userId} ({$email}) | IP: {$ip} | Agent: {$userAgent}");
    }

    /**
     * Handle failed login attempt.
     */
    public function handleUserFailedLogin(Failed $event): void
    {
        $ip = request()->ip();
        $userAgent = request()->userAgent();
        $attemptedEmail = $event->credentials['email'] ?? 'N/A';

        Log::warning("[SECURITY WARNING] Login Failed - Attempted Email: {$attemptedEmail} | IP: {$ip} | Agent: {$userAgent}");
    }

    /**
     * Handle brute force rate-limiting lockout.
     */
    public function handleUserLockout(Lockout $event): void
    {
        $ip = $event->request->ip();
        $userAgent = $event->request->userAgent();
        $attemptedEmail = $event->request->input('email', 'N/A');

        Log::alert("[SECURITY ALERT] Lockout Triggered (Brute-force Protection) - Target Email: {$attemptedEmail} | IP: {$ip} | Agent: {$userAgent}");
    }

    /**
     * Handle password reset event.
     */
    public function handlePasswordReset(PasswordReset $event): void
    {
        $ip = request()->ip();
        $userId = $event->user->getAuthIdentifier();
        $email = $event->user->email ?? 'N/A';

        Log::info("[SECURITY AUDIT] Password Reset Completed - User ID: {$userId} ({$email}) | IP: {$ip}");
    }

    /**
     * Handle user logout event.
     */
    public function handleUserLogout(Logout $event): void
    {
        if ($event->user) {
            $ip = request()->ip();
            $userId = $event->user->getAuthIdentifier();
            $email = $event->user->email ?? 'N/A';

            Log::info("[SECURITY AUDIT] User Logged Out - User ID: {$userId} ({$email}) | IP: {$ip}");
        }
    }

    /**
     * Register the listeners for the subscriber.
     */
    public function subscribe(Dispatcher $events): array
    {
        return [
            Login::class => 'handleUserLogin',
            Failed::class => 'handleUserFailedLogin',
            Lockout::class => 'handleUserLockout',
            PasswordReset::class => 'handlePasswordReset',
            Logout::class => 'handleUserLogout',
        ];
    }
}
