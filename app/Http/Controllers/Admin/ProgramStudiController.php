<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Jurusan;
use App\Models\ProgramStudi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProgramStudiController extends Controller
{
    // Tampilkan daftar program studi
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = ProgramStudi::query()
            ->with('jurusan')
            ->withCount(['mahasiswa'])
            ->orderBy('id', 'asc');

        // Batasi data sesuai peran
        if ($user->isAdminProdi()) {
            $query->where('id', $user->program_studi_id);
        } elseif ($user->isAdmin()) {
            $query->where('jurusan_id', $user->jurusan_id);
        } elseif ($request->filled('jurusan_id')) {
            $query->where('jurusan_id', $request->input('jurusan_id'));
        }

        if ($request->filled('q')) {
            $search = $request->input('q');
            $query->where(function ($q) use ($search) {
                $q->where('nama_prodi', 'like', "%{$search}%")
                    ->orWhere('kode_prodi', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $isActive = $request->input('status') === 'aktif';
            $query->where('is_active', $isActive);
        }

        $jurusanList = $user->isSuperAdmin()
            ? Jurusan::where('is_active', true)->orderBy('nama_jurusan')->get(['id', 'nama_jurusan'])
            : collect();

        return Inertia::render('Admin/ProgramStudi/Index', [
            'prodiList' => Inertia::defer(fn () => $query->paginate(10)->withQueryString()),
            'jurusanList' => $jurusanList,
            'filters' => [
                'q' => $request->input('q', ''),
                'jurusan_id' => $request->input('jurusan_id', ''),
                'status' => $request->input('status', ''),
            ],
            'canManageAll' => $user->isSuperAdmin(),
            'canCreate' => ! $user->isAdminProdi(),
            'canDelete' => ! $user->isAdminProdi(),
            'canToggle' => ! $user->isAdminProdi(),
        ]);
    }

    // Formulir tambah program studi
    public function create(Request $request): Response
    {
        $user = $request->user();

        if ($user->isAdminProdi()) {
            abort(403, 'Akses terbatas untuk Administrator Jurusan atau Super Admin.');
        }

        $jurusanList = $user->isSuperAdmin()
            ? Jurusan::where('is_active', true)->orderBy('nama_jurusan')->get(['id', 'nama_jurusan'])
            : Jurusan::where('id', $user->jurusan_id)->get(['id', 'nama_jurusan']);

        return Inertia::render('Admin/ProgramStudi/Form', [
            'prodi' => null,
            'jurusanList' => $jurusanList,
            'userJurusanId' => $user->jurusan_id,
            'canManageAll' => $user->isSuperAdmin(),
        ]);
    }

    // Simpan program studi baru
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->isAdminProdi()) {
            abort(403, 'Akses terbatas untuk Administrator Jurusan atau Super Admin.');
        }

        $validated = $request->validate([
            'nama_prodi' => ['required', 'string', 'max:255'],
            'kode_prodi' => ['nullable', 'string', 'max:20'],
            'jenjang' => ['required', 'string', 'in:D3,D4,S1,S2,S3,Profesi'],
            'jurusan_id' => ['required', 'exists:jurusan,id'],
            'is_active' => ['boolean'],
        ]);

        if ($user->isAdmin()) {
            $validated['jurusan_id'] = $user->jurusan_id;
        }

        ProgramStudi::create([
            'nama_prodi' => trim($validated['nama_prodi']),
            'kode_prodi' => !empty($validated['kode_prodi']) ? trim($validated['kode_prodi']) : null,
            'jenjang' => $validated['jenjang'],
            'jurusan_id' => $validated['jurusan_id'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('admin.program-studi.index')
            ->with('success', 'Program studi berhasil ditambahkan.');
    }

    // Formulir edit program studi
    public function edit(Request $request, ProgramStudi $programStudi): Response
    {
        $user = $request->user();

        if ($user->isAdminProdi() && $programStudi->id !== $user->program_studi_id) {
            abort(403, 'Anda tidak memiliki hak akses untuk mengubah program studi ini.');
        }

        if ($user->isAdmin() && $programStudi->jurusan_id !== $user->jurusan_id) {
            abort(403, 'Anda tidak memiliki hak akses untuk mengubah program studi ini.');
        }

        $jurusanId = $programStudi->jurusan_id ?: $user->jurusan_id;
        $jurusanList = $user->isSuperAdmin()
            ? Jurusan::where('is_active', true)->orderBy('nama_jurusan')->get(['id', 'nama_jurusan'])
            : Jurusan::where('id', $jurusanId)->get(['id', 'nama_jurusan']);

        return Inertia::render('Admin/ProgramStudi/Form', [
            'prodi' => $programStudi,
            'jurusanList' => $jurusanList,
            'userJurusanId' => $jurusanId,
            'canManageAll' => $user->isSuperAdmin(),
            'canManageStatus' => ! $user->isAdminProdi(),
        ]);
    }

    // Perbarui program studi
    public function update(Request $request, ProgramStudi $programStudi): RedirectResponse
    {
        $user = $request->user();

        if ($user->isAdminProdi() && $programStudi->id !== $user->program_studi_id) {
            abort(403, 'Anda tidak memiliki hak akses untuk mengubah program studi ini.');
        }

        if ($user->isAdmin() && $programStudi->jurusan_id !== $user->jurusan_id) {
            abort(403, 'Anda tidak memiliki hak akses untuk mengubah program studi ini.');
        }

        if (! $user->isSuperAdmin()) {
            $request->merge([
                'jurusan_id' => $programStudi->jurusan_id ?: $user->jurusan_id,
            ]);
        }

        $validated = $request->validate([
            'nama_prodi' => ['required', 'string', 'max:255'],
            'kode_prodi' => ['nullable', 'string', 'max:20'],
            'jenjang' => ['required', 'string', 'in:D3,D4,S1,S2,S3,Profesi'],
            'jurusan_id' => [$user->isSuperAdmin() ? 'required' : 'nullable', 'exists:jurusan,id'],
            'is_active' => ['boolean'],
        ]);

        if ($user->isAdminProdi()) {
            $validated['jurusan_id'] = $programStudi->jurusan_id;
            $validated['is_active'] = $programStudi->is_active;
        } elseif ($user->isAdmin()) {
            $validated['jurusan_id'] = $user->jurusan_id ?? $programStudi->jurusan_id;
        }

        $programStudi->update([
            'nama_prodi' => trim($validated['nama_prodi']),
            'kode_prodi' => !empty($validated['kode_prodi']) ? trim($validated['kode_prodi']) : null,
            'jenjang' => $validated['jenjang'],
            'jurusan_id' => $validated['jurusan_id'],
            'is_active' => $validated['is_active'] ?? $programStudi->is_active,
        ]);

        return redirect()->route('admin.program-studi.index')
            ->with('success', 'Program studi berhasil diperbarui.');
    }

    // Hapus program studi
    public function destroy(Request $request, ProgramStudi $programStudi): RedirectResponse
    {
        $user = $request->user();

        if ($user->isAdminProdi()) {
            abort(403, 'Akses terbatas untuk Administrator Jurusan atau Super Admin.');
        }

        if ($user->isAdmin() && $programStudi->jurusan_id !== $user->jurusan_id) {
            abort(403, 'Anda tidak memiliki hak akses untuk menghapus program studi ini.');
        }

        if ($programStudi->users()->exists()) {
            return redirect()->route('admin.program-studi.index')
                ->with('error', 'Program studi memiliki mahasiswa terdaftar dan tidak dapat dihapus.');
        }

        $programStudi->delete();

        return redirect()->route('admin.program-studi.index')
            ->with('success', 'Program studi berhasil dihapus.');
    }

    // Toggle status aktif program studi
    public function toggleStatus(Request $request, ProgramStudi $programStudi): RedirectResponse
    {
        $user = $request->user();

        if ($user->isAdminProdi()) {
            abort(403, 'Akses terbatas untuk Administrator Jurusan atau Super Admin.');
        }

        if ($user->isAdmin() && $programStudi->jurusan_id !== $user->jurusan_id) {
            abort(403, 'Anda tidak memiliki hak akses untuk mengubah status program studi ini.');
        }

        $programStudi->update([
            'is_active' => !$programStudi->is_active,
        ]);

        return redirect()->back()->with('success', 'Status program studi berhasil diperbarui.');
    }
}
