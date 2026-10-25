<?php

namespace Tests\Feature\Admin;

use App\Models\Jurusan;
use App\Models\ProgramStudi;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgramStudiCrudTest extends TestCase
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
            'email_verified_at' => now(),
            'role' => 'superadmin',
            'jurusan_id' => null,
            'is_active' => true,
            'password' => bcrypt('password'),
        ]);

        $this->admin = User::create([
            'name' => 'Admin Jurusan',
            'email' => 'admin.jurusan@ung.ac.id',
            'email_verified_at' => now(),
            'role' => 'admin',
            'jurusan_id' => $this->jurusan->id,
            'is_active' => true,
            'password' => bcrypt('password'),
        ]);

        $this->mahasiswa = User::create([
            'name' => 'Mahasiswa Test',
            'email' => '531422001@mahasiswa.ung.ac.id',
            'email_verified_at' => now(),
            'role' => 'mahasiswa',
            'jurusan_id' => $this->jurusan->id,
            'nim' => '531422001',
            'angkatan' => 2022,
            'is_active' => true,
            'password' => bcrypt('password'),
        ]);
    }

    public function test_mahasiswa_is_forbidden_from_program_studi(): void
    {
        $response = $this->actingAs($this->mahasiswa)->get(route('admin.program-studi.index'));
        $response->assertForbidden();
    }

    public function test_superadmin_can_view_program_studi(): void
    {
        $response = $this->actingAs($this->superAdmin)->get(route('admin.program-studi.index'));
        $response->assertOk();
    }

    public function test_admin_can_view_program_studi(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.program-studi.index'));
        $response->assertOk();
    }

    public function test_can_create_and_manage_program_studi(): void
    {
        $response = $this->actingAs($this->superAdmin)->post(route('admin.program-studi.store'), [
            'nama_prodi' => 'S1 Sistem Informasi',
            'kode_prodi' => '5324',
            'jenjang' => 'S1',
            'jurusan_id' => $this->jurusan->id,
            'is_active' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('program_studi', [
            'nama_prodi' => 'S1 Sistem Informasi',
            'kode_prodi' => '5324',
        ]);

        $prodi = ProgramStudi::where('kode_prodi', '5324')->firstOrFail();

        // Toggle status
        $this->actingAs($this->superAdmin)->patch(route('admin.program-studi.toggle', $prodi->id));
        $this->assertFalse($prodi->fresh()->is_active);

        // Delete
        $this->actingAs($this->superAdmin)->delete(route('admin.program-studi.destroy', $prodi->id));
        $this->assertDatabaseMissing('program_studi', ['id' => $prodi->id]);
    }
}
