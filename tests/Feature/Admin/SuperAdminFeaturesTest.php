<?php

namespace Tests\Feature\Admin;

use App\Models\AuthLog;
use App\Models\Jurusan;
use App\Models\Layanan;
use App\Models\SsoClient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SuperAdminFeaturesTest extends TestCase
{
    use RefreshDatabase;

    protected Jurusan $jurusan;
    protected User $superAdmin;
    protected User $admin;
    protected User $mahasiswa;

    protected function setUp(): void
    {
        parent::setUp();

        $this->jurusan = Jurusan::create([
            'nama_jurusan' => 'Teknik Informatika',
            'is_active' => true,
        ]);

        $this->superAdmin = User::create([
            'name' => 'Super Administrator',
            'email' => 'superadmin@ung.ac.id',
            'role' => 'superadmin',
            'jurusan_id' => null,
            'is_active' => true,
            'password' => bcrypt('password'),
        ]);

        $this->admin = User::create([
            'name' => 'Admin Jurusan',
            'email' => 'admin.jurusan@ung.ac.id',
            'role' => 'admin',
            'jurusan_id' => $this->jurusan->id,
            'is_active' => true,
            'password' => bcrypt('password'),
        ]);

        $this->mahasiswa = User::create([
            'name' => 'Mahasiswa Test',
            'email' => '531422001@mahasiswa.ung.ac.id',
            'role' => 'mahasiswa',
            'jurusan_id' => $this->jurusan->id,
            'nim' => '531422001',
            'angkatan' => 2022,
            'is_active' => true,
            'password' => bcrypt('password'),
        ]);
    }

    public function test_admin_is_forbidden_from_jurusan_management(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.jurusan.index'));
        $response->assertStatus(403);
    }

    public function test_superadmin_can_view_jurusan_list(): void
    {
        $response = $this->actingAs($this->superAdmin)->get(route('admin.jurusan.index'));
        $response->assertOk();
    }

    public function test_superadmin_can_create_jurusan(): void
    {
        $response = $this->actingAs($this->superAdmin)->post(route('admin.jurusan.store'), [
            'nama_jurusan' => 'Pendidikan Bahasa Inggris',
            'is_active' => true,
        ]);
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('jurusan', ['nama_jurusan' => 'Pendidikan Bahasa Inggris']);
    }

    public function test_superadmin_can_update_and_toggle_jurusan(): void
    {
        $jurusan = Jurusan::create([
            'nama_jurusan' => 'Sistem Informasi',
            'is_active' => true,
        ]);

        $this->actingAs($this->superAdmin)->patch(route('admin.jurusan.toggle', $jurusan->id));
        $this->assertFalse($jurusan->fresh()->is_active);

        $this->actingAs($this->superAdmin)->put(route('admin.jurusan.update', $jurusan->id), [
            'nama_jurusan' => 'Sistem Informasi Terapan',
            'is_active' => true,
        ]);
        $this->assertEquals('Sistem Informasi Terapan', $jurusan->fresh()->nama_jurusan);
    }

    public function test_superadmin_can_delete_unused_jurusan(): void
    {
        $jurusan = Jurusan::create([
            'nama_jurusan' => 'Jurusan Sementara',
            'is_active' => true,
        ]);

        $this->actingAs($this->superAdmin)->delete(route('admin.jurusan.destroy', $jurusan->id));
        $this->assertDatabaseMissing('jurusan', ['id' => $jurusan->id]);
    }

    public function test_superadmin_cannot_delete_jurusan_with_users(): void
    {
        $this->actingAs($this->superAdmin)->delete(route('admin.jurusan.destroy', $this->jurusan->id));
        $this->assertDatabaseHas('jurusan', ['id' => $this->jurusan->id]);
    }

    public function test_mahasiswa_is_forbidden_from_user_management(): void
    {
        $response = $this->actingAs($this->mahasiswa)->get(route('admin.users.index'));
        $response->assertStatus(403);
    }

    public function test_superadmin_can_view_users_list(): void
    {
        $response = $this->actingAs($this->superAdmin)->get(route('admin.users.index'));
        $response->assertOk();
    }

    public function test_superadmin_can_create_user(): void
    {
        $response = $this->actingAs($this->superAdmin)->post(route('admin.users.store'), [
            'name' => 'Admin Baru',
            'email' => 'admin.baru@ung.ac.id',
            'role' => 'admin',
            'jurusan_id' => $this->jurusan->id,
            'password' => 'password123',
            'is_active' => true,
        ]);
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('users', ['email' => 'admin.baru@ung.ac.id']);
    }

    public function test_superadmin_can_update_and_toggle_user(): void
    {
        $user = User::create([
            'name' => 'Target User',
            'email' => 'target.user@ung.ac.id',
            'role' => 'mahasiswa',
            'jurusan_id' => $this->jurusan->id,
            'is_active' => true,
            'password' => bcrypt('password123'),
        ]);

        $this->actingAs($this->superAdmin)->patch(route('admin.users.toggle', $user->id));
        $this->assertFalse($user->fresh()->is_active);

        $this->actingAs($this->superAdmin)->put(route('admin.users.update', $user->id), [
            'name' => 'Target User Updated',
            'email' => 'target.user@ung.ac.id',
            'role' => 'mahasiswa',
            'jurusan_id' => $this->jurusan->id,
            'is_active' => true,
        ]);
        $this->assertEquals('Target User Updated', $user->fresh()->name);
    }

    public function test_superadmin_cannot_toggle_self_status(): void
    {
        $this->actingAs($this->superAdmin)->patch(route('admin.users.toggle', $this->superAdmin->id))
            ->assertSessionHas('error');
    }

    public function test_superadmin_can_manage_sso_clients(): void
    {
        $layanan = Layanan::create([
            'jurusan_id' => $this->jurusan->id,
            'nama_layanan' => 'Sistem Arsip Digital',
            'slug' => 'sistem-arsip-digital',
            'url' => 'https://arsip.ung.ac.id',
            'tipe_integrasi' => 'sso',
            'is_active' => true,
            'urutan' => 1,
        ]);

        $this->actingAs($this->superAdmin)->get(route('admin.sso-clients.index'))->assertOk();

        $this->actingAs($this->superAdmin)->post(route('admin.sso-clients.store'), [
            'layanan_id' => $layanan->id,
            'redirect_uri' => 'https://arsip.ung.ac.id/auth/callback',
            'is_active' => true,
        ]);

        $this->assertDatabaseHas('sso_clients', [
            'layanan_id' => $layanan->id,
        ]);

        $client = SsoClient::where('layanan_id', $layanan->id)->first();
        $oldSecret = $client->client_secret;

        $this->actingAs($this->superAdmin)->put(route('admin.sso-clients.update', $client->id), [
            'redirect_uri' => 'https://arsip.ung.ac.id/callback',
            'is_active' => true,
        ]);
        $this->assertEquals('https://arsip.ung.ac.id/callback', $client->fresh()->redirect_uri);

        $this->actingAs($this->superAdmin)->post(route('admin.sso-clients.secret', $client->id));
        $this->assertNotEquals($oldSecret, $client->fresh()->client_secret);

        $this->actingAs($this->superAdmin)->patch(route('admin.sso-clients.toggle', $client->id));
        $this->assertFalse($client->fresh()->is_active);

        $this->actingAs($this->superAdmin)->delete(route('admin.sso-clients.destroy', $client->id));
        $this->assertDatabaseMissing('sso_clients', ['id' => $client->id]);
    }

    public function test_admin_is_forbidden_from_audit_logs(): void
    {
        $this->actingAs($this->admin)->get(route('admin.audit-logs.index'))->assertStatus(403);
    }

    public function test_superadmin_can_view_audit_logs(): void
    {
        AuthLog::create([
            'user_id' => $this->superAdmin->id,
            'event' => 'login',
            'email' => $this->superAdmin->email,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'PHPUnit/Test',
            'status' => 'success',
            'message' => 'Login berhasil via credential',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($this->superAdmin)->get(route('admin.audit-logs.index'));
        $response->assertOk();
    }
}
