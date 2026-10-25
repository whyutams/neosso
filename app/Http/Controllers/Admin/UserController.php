<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Jurusan;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    // Tampilkan daftar pengguna
    public function index(Request $request): Response
    {
        $currentUser = $request->user();

        if (! $currentUser->isSuperAdmin()) {
            abort(403, 'Akses terbatas untuk Super Admin.');
        }

        $query = User::query()
            ->with(['jurusan', 'programStudi'])
            ->orderBy('id', 'desc');

        // Filter pencarian nama, email, atau nim
        if ($request->filled('q')) {
            $search = $request->input('q');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('nim', 'like', "%{$search}%");
            });
        }

        // Filter role
        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        // Filter jurusan
        if ($request->filled('jurusan_id')) {
            $query->where('jurusan_id', $request->input('jurusan_id'));
        }

        // Filter status
        if ($request->filled('status')) {
            $isActive = $request->input('status') === 'aktif';
            $query->where('is_active', $isActive);
        }

        $jurusanList = Jurusan::where('is_active', true)
            ->select('id', 'nama_jurusan')
            ->orderBy('nama_jurusan')
            ->get();

        $prodiList = \App\Models\ProgramStudi::where('is_active', true)
            ->select('id', 'jurusan_id', 'nama_prodi', 'jenjang')
            ->orderBy('nama_prodi')
            ->get();

        return Inertia::render('Admin/Users/Index', [
            'users' => Inertia::defer(fn () => $query->paginate(10)->withQueryString()),
            'jurusanList' => $jurusanList,
            'prodiList' => $prodiList,
            'filters' => [
                'q' => $request->input('q', ''),
                'role' => $request->input('role', ''),
                'jurusan_id' => $request->input('jurusan_id', ''),
                'status' => $request->input('status', ''),
            ],
            'canManageAdmins' => true,
        ]);
    }

    // Formulir tambah pengguna baru
    public function create(Request $request): Response
    {
        $currentUser = $request->user();

        if (! $currentUser->isSuperAdmin()) {
            abort(403, 'Akses terbatas untuk Super Admin.');
        }

        $jurusanList = Jurusan::where('is_active', true)
            ->select('id', 'nama_jurusan')
            ->orderBy('nama_jurusan')
            ->get();

        $prodiList = \App\Models\ProgramStudi::where('is_active', true)
            ->select('id', 'jurusan_id', 'nama_prodi', 'jenjang')
            ->orderBy('nama_prodi')
            ->get();

        return Inertia::render('Admin/Users/Form', [
            'user' => null,
            'jurusanList' => $jurusanList,
            'prodiList' => $prodiList,
            'currentUserId' => $currentUser->id,
        ]);
    }

    // Simpan pengguna baru
    public function store(Request $request): RedirectResponse
    {
        $currentUser = $request->user();

        if (! $currentUser->isSuperAdmin()) {
            abort(403, 'Akses terbatas untuk Super Admin.');
        }

        if ($request->input('role') === 'mahasiswa' && $request->filled('program_studi_id')) {
            $prodi = \App\Models\ProgramStudi::find($request->input('program_studi_id'));
            if ($prodi) {
                $request->merge(['jurusan_id' => $prodi->jurusan_id]);
            }
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'confirmed', Password::min(8)->letters()->numbers()],
            'role' => ['required', 'string', Rule::in(['superadmin', 'admin', 'mahasiswa'])],
            'jurusan_id' => [
                'nullable',
                Rule::requiredIf(fn () => in_array($request->input('role'), ['admin', 'mahasiswa'])),
                'exists:jurusan,id',
            ],
            'program_studi_id' => [
                'nullable',
                Rule::requiredIf(fn () => $request->input('role') === 'mahasiswa'),
                'exists:program_studi,id',
            ],
            'nim' => ['nullable', 'string', 'max:20', 'unique:users,nim'],
            'angkatan' => ['nullable', 'integer', 'min:2000', 'max:'.(date('Y') + 1)],
            'is_active' => ['boolean'],
        ]);

        $role = $validated['role'];
        $jurusanId = in_array($role, ['admin', 'mahasiswa']) ? ($validated['jurusan_id'] ?? null) : null;
        $prodiId = $role === 'mahasiswa' ? ($validated['program_studi_id'] ?? null) : null;
        $nim = $role === 'mahasiswa' && ! empty($validated['nim']) ? trim($validated['nim']) : null;
        $angkatan = $role === 'mahasiswa' ? ($validated['angkatan'] ?? null) : null;

        User::create([
            'name' => trim($validated['name']),
            'email' => strtolower(trim($validated['email'])),
            'role' => $role,
            'jurusan_id' => $jurusanId,
            'program_studi_id' => $prodiId,
            'nim' => $nim,
            'angkatan' => $angkatan,
            'password' => Hash::make($validated['password']),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('admin.users.index')->with('success', 'Pengguna berhasil ditambahkan.');
    }

    // Hapus pengguna
    public function destroy(Request $request, User $user): RedirectResponse
    {
        $currentUser = $request->user();

        if (! $currentUser->isSuperAdmin()) {
            abort(403, 'Akses terbatas untuk Super Admin.');
        }

        if ($user->id === $currentUser->id) {
            return back()->with('error', 'Anda tidak dapat menghapus akun sendiri.');
        }

        $user->delete();

        return back()->with('success', 'Pengguna berhasil dihapus.');
    }

    // Toggle status pengguna
    public function toggleStatus(Request $request, User $user): RedirectResponse
    {
        $currentUser = $request->user();

        if (! $currentUser->isSuperAdmin()) {
            abort(403, 'Akses terbatas untuk Super Admin.');
        }

        if ($user->id === $currentUser->id) {
            return back()->with('error', 'Anda tidak dapat mengubah status akun sendiri.');
        }

        $user->update([
            'is_active' => ! $user->is_active,
        ]);

        return back()->with('success', 'Status pengguna berhasil diperbarui.');
    }
}
