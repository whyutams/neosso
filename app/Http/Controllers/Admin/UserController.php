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

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', 'string', Rule::in(['superadmin', 'admin', 'mahasiswa'])],
            'jurusan_id' => [
                'nullable',
                Rule::requiredIf(fn () => in_array($request->input('role'), ['admin', 'mahasiswa'])),
                'exists:jurusan,id',
            ],
            'program_studi_id' => ['nullable', 'exists:program_studi,id'],
            'nim' => ['nullable', 'string', 'max:20', 'unique:users,nim'],
            'angkatan' => ['nullable', 'integer', 'min:2000', 'max:'.(date('Y') + 1)],
            'password' => ['required', 'string', Password::min(8)],
            'is_active' => ['boolean'],
        ]);

        User::create([
            'name' => trim($validated['name']),
            'email' => strtolower(trim($validated['email'])),
            'role' => $validated['role'],
            'jurusan_id' => $validated['jurusan_id'] ?? null,
            'program_studi_id' => $validated['program_studi_id'] ?? null,
            'nim' => ! empty($validated['nim']) ? trim($validated['nim']) : null,
            'angkatan' => $validated['angkatan'] ?? null,
            'password' => Hash::make($validated['password']),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('admin.users.index')->with('success', 'Pengguna berhasil ditambahkan.');
    }

    // Formulir edit pengguna
    public function edit(Request $request, User $user): Response
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
            'user' => $user->load(['jurusan', 'programStudi']),
            'jurusanList' => $jurusanList,
            'prodiList' => $prodiList,
            'currentUserId' => $currentUser->id,
        ]);
    }

    // Perbarui data pengguna
    public function update(Request $request, User $user): RedirectResponse
    {
        $currentUser = $request->user();

        if (! $currentUser->isSuperAdmin()) {
            abort(403, 'Akses terbatas untuk Super Admin.');
        }

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', 'string', Rule::in(['superadmin', 'admin', 'mahasiswa'])],
            'jurusan_id' => [
                'nullable',
                Rule::requiredIf(fn () => in_array($request->input('role'), ['admin', 'mahasiswa'])),
                'exists:jurusan,id',
            ],
            'program_studi_id' => ['nullable', 'exists:program_studi,id'],
            'nim' => ['nullable', 'string', 'max:20', Rule::unique('users', 'nim')->ignore($user->id)],
            'angkatan' => ['nullable', 'integer', 'min:2000', 'max:'.(date('Y') + 1)],
            'is_active' => ['boolean'],
        ];

        if ($request->filled('password')) {
            $rules['password'] = ['nullable', 'string', Password::min(8)];
        }

        $validated = $request->validate($rules);

        // Larang menurunkan role sendiri
        if ($user->id === $currentUser->id && $validated['role'] !== $currentUser->role) {
            return back()->with('error', 'Anda tidak dapat mengubah role akun sendiri.');
        }

        // Larang menonaktifkan akun sendiri
        if ($user->id === $currentUser->id && ! $request->boolean('is_active', true)) {
            return back()->with('error', 'Anda tidak dapat menonaktifkan akun sendiri.');
        }

        $payload = [
            'name' => trim($validated['name']),
            'email' => strtolower(trim($validated['email'])),
            'role' => $validated['role'],
            'jurusan_id' => $validated['jurusan_id'] ?? null,
            'program_studi_id' => $validated['program_studi_id'] ?? null,
            'nim' => ! empty($validated['nim']) ? trim($validated['nim']) : null,
            'angkatan' => $validated['angkatan'] ?? null,
            'is_active' => $request->boolean('is_active', $user->is_active),
        ];

        if ($request->filled('password')) {
            $payload['password'] = Hash::make($request->input('password'));
        }

        $user->update($payload);

        return redirect()->route('admin.users.index')->with('success', 'Pengguna berhasil diperbarui.');
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
