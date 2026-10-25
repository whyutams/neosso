<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Jurusan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class JurusanController extends Controller
{
    // Tampilkan daftar jurusan
    public function index(Request $request): Response
    {
        if (! $request->user()->isSuperAdmin()) {
            abort(403, 'Akses terbatas untuk Super Admin.');
        }

        $query = Jurusan::query()
            ->withCount(['admins', 'mahasiswa', 'layanan', 'programStudi'])
            ->orderBy('id', 'asc');

        if ($request->filled('q')) {
            $search = $request->input('q');
            $query->where('nama_jurusan', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $isActive = $request->input('status') === 'aktif';
            $query->where('is_active', $isActive);
        }

        return Inertia::render('Admin/Jurusan/Index', [
            'jurusanList' => Inertia::defer(fn () => $query->paginate(10)->withQueryString()),
            'filters' => [
                'q' => $request->input('q', ''),
                'status' => $request->input('status', ''),
            ],
        ]);
    }

    // Formulir tambah jurusan baru
    public function create(Request $request): Response
    {
        if (! $request->user()->isSuperAdmin()) {
            abort(403, 'Akses terbatas untuk Super Admin.');
        }

        return Inertia::render('Admin/Jurusan/Form', [
            'jurusan' => null,
        ]);
    }

    // Simpan jurusan baru
    public function store(Request $request): RedirectResponse
    {
        if (! $request->user()->isSuperAdmin()) {
            abort(403, 'Akses terbatas untuk Super Admin.');
        }

        $validated = $request->validate([
            'nama_jurusan' => ['required', 'string', 'max:255', 'unique:jurusan,nama_jurusan'],
            'is_active' => ['boolean'],
        ]);

        Jurusan::create([
            'nama_jurusan' => trim($validated['nama_jurusan']),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('admin.jurusan.index')->with('success', 'Jurusan berhasil ditambahkan.');
    }

    // Formulir edit jurusan
    public function edit(Request $request, Jurusan $jurusan): Response
    {
        if (! $request->user()->isSuperAdmin()) {
            abort(403, 'Akses terbatas untuk Super Admin.');
        }

        return Inertia::render('Admin/Jurusan/Form', [
            'jurusan' => $jurusan,
        ]);
    }

    // Perbarui data jurusan
    public function update(Request $request, Jurusan $jurusan): RedirectResponse
    {
        if (! $request->user()->isSuperAdmin()) {
            abort(403, 'Akses terbatas untuk Super Admin.');
        }

        $validated = $request->validate([
            'nama_jurusan' => ['required', 'string', 'max:255', Rule::unique('jurusan', 'nama_jurusan')->ignore($jurusan->id)],
            'is_active' => ['boolean'],
        ]);

        $jurusan->update([
            'nama_jurusan' => trim($validated['nama_jurusan']),
            'is_active' => $request->boolean('is_active', $jurusan->is_active),
        ]);

        return redirect()->route('admin.jurusan.index')->with('success', 'Jurusan berhasil diperbarui.');
    }

    // Hapus jurusan
    public function destroy(Request $request, Jurusan $jurusan): RedirectResponse
    {
        if (! $request->user()->isSuperAdmin()) {
            abort(403, 'Akses terbatas untuk Super Admin.');
        }

        if ($jurusan->users()->exists() || $jurusan->layanan()->exists()) {
            return back()->with('error', 'Jurusan tidak dapat dihapus karena masih memiliki relasi pengguna atau layanan.');
        }

        $jurusan->delete();

        return back()->with('success', 'Jurusan berhasil dihapus.');
    }

    // Toggle status aktif/nonaktif
    public function toggleStatus(Request $request, Jurusan $jurusan): RedirectResponse
    {
        if (! $request->user()->isSuperAdmin()) {
            abort(403, 'Akses terbatas untuk Super Admin.');
        }

        $jurusan->update([
            'is_active' => ! $jurusan->is_active,
        ]);

        return back()->with('success', 'Status jurusan berhasil diperbarui.');
    }
}
