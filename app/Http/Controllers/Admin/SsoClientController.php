<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Layanan;
use App\Models\SsoClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SsoClientController extends Controller
{
    // Tampilkan daftar klien SSO
    public function index(Request $request): Response
    {
        if (! $request->user()->isSuperAdmin()) {
            abort(403, 'Akses terbatas untuk Super Admin.');
        }

        $query = SsoClient::query()
            ->with(['layanan', 'creator'])
            ->orderBy('id', 'desc');

        if ($request->filled('q')) {
            $search = $request->input('q');
            $query->where(function ($q) use ($search) {
                $q->where('client_id', 'like', "%{$search}%")
                    ->orWhereHas('layanan', function ($lq) use ($search) {
                        $lq->where('nama_layanan', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('status')) {
            $isActive = $request->input('status') === 'aktif';
            $query->where('is_active', $isActive);
        }

        // Ambil daftar layanan yang belum memiliki klien SSO
        $availableLayanan = Layanan::where('is_active', true)
            ->whereDoesntHave('ssoClient')
            ->select('id', 'nama_layanan', 'url')
            ->orderBy('nama_layanan')
            ->get();

        return Inertia::render('Admin/SsoClients/Index', [
            'clients' => Inertia::defer(fn () => $query->paginate(10)->withQueryString()),
            'availableLayanan' => $availableLayanan,
            'filters' => [
                'q' => $request->input('q', ''),
                'status' => $request->input('status', ''),
            ],
        ]);
    }

    // Formulir tambah klien SSO baru
    public function create(Request $request): Response
    {
        if (! $request->user()->isSuperAdmin()) {
            abort(403, 'Akses terbatas untuk Super Admin.');
        }

        $availableLayanan = Layanan::where('is_active', true)
            ->whereDoesntHave('ssoClient')
            ->select('id', 'nama_layanan', 'url')
            ->orderBy('nama_layanan')
            ->get();

        return Inertia::render('Admin/SsoClients/Form', [
            'client' => null,
            'availableLayanan' => $availableLayanan,
        ]);
    }

    // Daftarkan klien SSO baru
    public function store(Request $request): RedirectResponse
    {
        if (! $request->user()->isSuperAdmin()) {
            abort(403, 'Akses terbatas untuk Super Admin.');
        }

        $validated = $request->validate([
            'layanan_id' => ['required', 'exists:layanan,id', 'unique:sso_clients,layanan_id'],
            'redirect_uri' => ['required', 'string'],
            'is_active' => ['boolean'],
        ]);

        SsoClient::create([
            'layanan_id' => $validated['layanan_id'],
            'client_id' => 'sso_' . Str::lower(Str::random(18)),
            'client_secret' => Str::random(40),
            'redirect_uri' => trim($validated['redirect_uri']),
            'is_active' => $request->boolean('is_active', true),
            'created_by' => $request->user()->id,
        ]);

        return redirect()->route('admin.sso-clients.index')->with('success', 'Klien SSO berhasil didaftarkan.');
    }

    // Formulir edit klien SSO
    public function edit(Request $request, SsoClient $ssoClient): Response
    {
        if (! $request->user()->isSuperAdmin()) {
            abort(403, 'Akses terbatas untuk Super Admin.');
        }

        return Inertia::render('Admin/SsoClients/Form', [
            'client' => $ssoClient->load('layanan'),
            'availableLayanan' => [],
        ]);
    }

    // Perbarui klien SSO
    public function update(Request $request, SsoClient $ssoClient): RedirectResponse
    {
        if (! $request->user()->isSuperAdmin()) {
            abort(403, 'Akses terbatas untuk Super Admin.');
        }

        $validated = $request->validate([
            'redirect_uri' => ['required', 'string'],
            'is_active' => ['boolean'],
        ]);

        $ssoClient->update([
            'redirect_uri' => trim($validated['redirect_uri']),
            'is_active' => $request->boolean('is_active', $ssoClient->is_active),
        ]);

        return redirect()->route('admin.sso-clients.index')->with('success', 'Klien SSO berhasil diperbarui.');
    }

    // Hapus klien SSO
    public function destroy(Request $request, SsoClient $ssoClient): RedirectResponse
    {
        if (! $request->user()->isSuperAdmin()) {
            abort(403, 'Akses terbatas untuk Super Admin.');
        }

        $ssoClient->delete();

        return back()->with('success', 'Klien SSO berhasil dihapus.');
    }

    // Toggle status klien SSO
    public function toggleStatus(Request $request, SsoClient $ssoClient): RedirectResponse
    {
        if (! $request->user()->isSuperAdmin()) {
            abort(403, 'Akses terbatas untuk Super Admin.');
        }

        $ssoClient->update([
            'is_active' => ! $ssoClient->is_active,
        ]);

        return back()->with('success', 'Status klien SSO berhasil diperbarui.');
    }

    // Regenerate client secret
    public function regenerateSecret(Request $request, SsoClient $ssoClient): RedirectResponse
    {
        if (! $request->user()->isSuperAdmin()) {
            abort(403, 'Akses terbatas untuk Super Admin.');
        }

        $ssoClient->update([
            'client_secret' => Str::random(40),
        ]);

        return back()->with('success', 'Client Secret berhasil dibuat ulang.');
    }
}
