<?php

namespace Tests\Feature\Admin;

use App\Models\Jurusan;
use App\Models\Layanan;
use App\Models\SsoClient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LayananCrudTest extends TestCase
{
    use RefreshDatabase;

    protected Jurusan $jurusanInformatika;
    protected Jurusan $jurusanElektro;
    protected User $superAdmin;
    protected User $adminInformatika;
    protected User $mahasiswa;

    protected function setUp(): void
    {
        parent::setUp();

        $this->jurusanInformatika = Jurusan::create([
            'nama_jurusan' => 'Informatika',
            'is_active' => true,
        ]);

        $this->jurusanElektro = Jurusan::create([
            'nama_jurusan' => 'Teknik Elektro',
            'is_active' => true,
        ]);

        $this->superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@ung.ac.id',
            'role' => 'superadmin',
            'jurusan_id' => null,
            'is_active' => true,
            'password' => bcrypt('password'),
        ]);

        $this->adminInformatika = User::create([
            'name' => 'Admin Informatika',
            'email' => 'admin.informatika@ung.ac.id',
            'role' => 'admin',
            'jurusan_id' => $this->jurusanInformatika->id,
            'is_active' => true,
            'password' => bcrypt('password'),
        ]);

        $this->mahasiswa = User::create([
            'name' => 'Mahasiswa Test',
            'email' => '531424001@mahasiswa.ung.ac.id',
            'role' => 'mahasiswa',
            'jurusan_id' => $this->jurusanInformatika->id,
            'nim' => '531424001',
            'angkatan' => 2024,
            'is_active' => true,
            'password' => bcrypt('password'),
        ]);
    }

    public function test_guest_cannot_access_layanan_crud(): void
    {
        $response = $this->get(route('admin.layanan.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_mahasiswa_is_forbidden_from_admin_layanan_crud(): void
    {
        $response = $this->actingAs($this->mahasiswa)->get(route('admin.layanan.index'));
        $response->assertStatus(403);
    }

    public function test_admin_can_view_layanan_list(): void
    {
        Layanan::create([
            'jurusan_id' => $this->jurusanInformatika->id,
            'nama_layanan' => 'Layanan Skripsi',
            'slug' => 'layanan-skripsi',
            'url' => 'http://localhost:8001/auth/callback',
            'tipe_integrasi' => 'sso',
            'is_active' => true,
            'urutan' => 1,
        ]);

        $response = $this->actingAs($this->adminInformatika)->get(route('admin.layanan.index'));
        $response->assertOk();
    }

    public function test_admin_can_create_new_sso_layanan(): void
    {
        $payload = [
            'nama_layanan' => 'Sistem Bebas Lab Komputer',
            'slug' => 'sistem-bebas-lab',
            'url' => 'http://localhost:8002/auth/callback',
            'deskripsi' => 'Pengurusan surat bebas lab.',
            'tipe_integrasi' => 'sso',
            'is_active' => true,
            'urutan' => 2,
            'client_id' => 'client_bebas_lab_test',
            'client_secret' => 'supersecretpassword123',
            'redirect_uri' => "http://localhost:8002/auth/callback\nhttp://127.0.0.1:8002/auth/callback",
        ];

        $response = $this->actingAs($this->adminInformatika)->post(route('admin.layanan.store'), $payload);

        $response->assertRedirect(route('admin.layanan.index'));
        $this->assertDatabaseHas('layanan', [
            'nama_layanan' => 'Sistem Bebas Lab Komputer',
            'slug' => 'sistem-bebas-lab',
            'jurusan_id' => $this->jurusanInformatika->id,
            'tipe_integrasi' => 'sso',
        ]);

        $this->assertDatabaseHas('sso_clients', [
            'client_id' => 'client_bebas_lab_test',
        ]);
    }

    public function test_admin_can_update_layanan(): void
    {
        $layanan = Layanan::create([
            'jurusan_id' => $this->jurusanInformatika->id,
            'nama_layanan' => 'Judul Lama',
            'slug' => 'judul-lama',
            'url' => 'https://ung.ac.id/old',
            'tipe_integrasi' => 'link_eksternal',
            'is_active' => true,
            'urutan' => 1,
        ]);

        $response = $this->actingAs($this->adminInformatika)->put(route('admin.layanan.update', $layanan), [
            'nama_layanan' => 'Judul Baru Diperbarui',
            'slug' => 'judul-baru-diperbarui',
            'url' => 'https://ung.ac.id/new',
            'tipe_integrasi' => 'link_eksternal',
            'is_active' => false,
            'urutan' => 5,
        ]);

        $response->assertRedirect(route('admin.layanan.index'));
        $this->assertDatabaseHas('layanan', [
            'id' => $layanan->id,
            'nama_layanan' => 'Judul Baru Diperbarui',
            'is_active' => false,
            'urutan' => 5,
        ]);
    }

    public function test_admin_can_toggle_layanan_status(): void
    {
        $layanan = Layanan::create([
            'jurusan_id' => $this->jurusanInformatika->id,
            'nama_layanan' => 'Layanan Toggle Test',
            'slug' => 'layanan-toggle-test',
            'url' => 'https://ung.ac.id/test',
            'tipe_integrasi' => 'link_eksternal',
            'is_active' => true,
            'urutan' => 1,
        ]);

        $response = $this->actingAs($this->adminInformatika)->patch(route('admin.layanan.toggle', $layanan));
        $response->assertRedirect();

        $this->assertDatabaseHas('layanan', [
            'id' => $layanan->id,
            'is_active' => false,
        ]);
    }

    public function test_admin_can_delete_layanan(): void
    {
        $layanan = Layanan::create([
            'jurusan_id' => $this->jurusanInformatika->id,
            'nama_layanan' => 'Layanan Hapus Test',
            'slug' => 'layanan-hapus-test',
            'url' => 'https://ung.ac.id/delete',
            'tipe_integrasi' => 'link_eksternal',
            'is_active' => true,
            'urutan' => 1,
        ]);

        $response = $this->actingAs($this->adminInformatika)->delete(route('admin.layanan.destroy', $layanan));
        $response->assertRedirect(route('admin.layanan.index'));

        $this->assertDatabaseMissing('layanan', [
            'id' => $layanan->id,
        ]);
    }

    public function test_admin_cannot_manage_layanan_of_other_jurusan(): void
    {
        $layananElektro = Layanan::create([
            'jurusan_id' => $this->jurusanElektro->id,
            'nama_layanan' => 'Layanan Milik Elektro',
            'slug' => 'layanan-milik-elektro',
            'url' => 'https://elektro.ung.ac.id',
            'tipe_integrasi' => 'link_eksternal',
            'is_active' => true,
            'urutan' => 1,
        ]);

        // Admin Informatika mencoba update layanan milik Elektro
        $response = $this->actingAs($this->adminInformatika)->put(route('admin.layanan.update', $layananElektro), [
            'nama_layanan' => 'Hack Nama',
            'slug' => 'hack-nama',
            'url' => 'https://hacked.com',
            'tipe_integrasi' => 'link_eksternal',
            'is_active' => true,
            'urutan' => 1,
        ]);

        $response->assertStatus(403);
    }

    // Uji validasi input URL deteksi ikon
    public function test_detect_icon_requires_valid_url(): void
    {
        $response = $this->actingAs($this->adminInformatika)->postJson(route('admin.layanan.detect-icon'), [
            'url' => 'bukan-url-valid',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['url']);
    }

    // Uji deteksi ikon dengan fake HTTP client
    public function test_admin_can_detect_icon(): void
    {
        \Illuminate\Support\Facades\Http::fake([
            'https://siat.ung.ac.id' => \Illuminate\Support\Facades\Http::response('<html><head><link rel="icon" href="/fav.png"></head></html>', 200),
            'https://siat.ung.ac.id/fav.png' => \Illuminate\Support\Facades\Http::response('fake-png-bytes', 200, ['Content-Type' => 'image/png']),
        ]);

        $response = $this->actingAs($this->adminInformatika)->postJson(route('admin.layanan.detect-icon'), [
            'url' => 'https://siat.ung.ac.id',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertStringStartsWith('data:image/png;base64,', $response->json('icon_url'));
    }

    // Uji akses tamu ke endpoint search preview
    public function test_guest_cannot_access_search_preview(): void
    {
        $response = $this->getJson(route('layanan.search-preview', ['q' => 'Skripsi']));
        $response->assertUnauthorized();
    }

    // Uji preview pencarian global layanan
    public function test_authenticated_user_can_search_layanan_preview(): void
    {
        Layanan::create([
            'jurusan_id' => $this->jurusanInformatika->id,
            'nama_layanan' => 'Portal Layanan Skripsi Online',
            'slug' => 'portal-layanan-skripsi-online',
            'url' => 'https://skripsi.ung.ac.id',
            'deskripsi' => 'Pengajuan judul dan bimbingan skripsi.',
            'tipe_integrasi' => 'sso',
            'is_active' => true,
            'urutan' => 1,
        ]);

        $response = $this->actingAs($this->mahasiswa)->getJson(route('layanan.search-preview', ['q' => 'Skripsi']));

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment([
                'nama_layanan' => 'Portal Layanan Skripsi Online',
                'slug' => 'portal-layanan-skripsi-online',
            ]);
    }

    // Uji preview pencarian query kosong mengembalikan array kosong
    public function test_search_preview_returns_empty_when_q_is_empty(): void
    {
        $response = $this->actingAs($this->mahasiswa)->getJson(route('layanan.search-preview', ['q' => '']));

        $response->assertOk()
            ->assertJson([]);
    }

    // Uji mahasiswa tidak dapat melihat layanan nonaktif pada search preview
    public function test_mahasiswa_does_not_see_inactive_layanan_in_search_preview(): void
    {
        Layanan::create([
            'jurusan_id' => $this->jurusanInformatika->id,
            'nama_layanan' => 'Layanan Rahasia Nonaktif',
            'slug' => 'layanan-rahasia-nonaktif',
            'url' => 'https://rahasia.ung.ac.id',
            'tipe_integrasi' => 'link_eksternal',
            'is_active' => false,
            'urutan' => 1,
        ]);

        $response = $this->actingAs($this->mahasiswa)->getJson(route('layanan.search-preview', ['q' => 'Rahasia']));

        $response->assertOk()
            ->assertJsonCount(0);
    }
}

