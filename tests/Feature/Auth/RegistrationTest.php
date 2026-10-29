<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_is_not_available(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(404);
    }

    public function test_self_registration_endpoint_is_not_available(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password12345!',
            'password_confirmation' => 'Password12345!',
        ]);

        $response->assertStatus(404);
        $this->assertGuest();
    }
}
