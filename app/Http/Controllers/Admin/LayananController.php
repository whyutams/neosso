<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AksesLayanan;
use App\Models\Jurusan;
use App\Models\Layanan;
use App\Models\SsoClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LayananController extends Controller
{
    /**
     * Tampilkan daftar layanan.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = Layanan::with(['jurusan', 'ssoClient', 'aksesLayanan'])
            ->orderBy('urutan', 'asc')
            ->orderBy('id', 'asc');

        if (! $user->isSuperAdmin()) {
            $query->where('jurusan_id', $user->jurusan_id);
        } elseif ($request->filled('jurusan_id')) {
            $query->where('jurusan_id', $request->integer('jurusan_id'));
        }

        if ($request->filled('q')) {
            $search = $request->string('q')->trim();
            $query->where(function ($q) use ($search) {
                $q->where('nama_layanan', 'like', "%{$search}%")
                    ->orWhere('deskripsi', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($request->filled('tipe') && in_array($request->input('tipe'), ['sso', 'link_eksternal'], true)) {
            $query->where('tipe_integrasi', $request->input('tipe'));
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->input('status') === 'aktif');
        }

        $jurusanList = $user->isSuperAdmin()
            ? Jurusan::where('is_active', true)->select('id', 'nama_jurusan')->get()
            : collect();

        return Inertia::render('Admin/Layanan/Index', [
            'layananList' => Inertia::defer(fn () => $query->paginate(15)->withQueryString()),
            'filters' => $request->only(['q', 'tipe', 'status', 'jurusan_id']),
            'jurusanList' => $jurusanList,
            'isSuperAdmin' => $user->isSuperAdmin(),
            'currentJurusan' => $user->jurusan,
        ]);
    }

    /**
     * Form tambah layanan.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();

        $jurusanList = $user->isSuperAdmin()
            ? Jurusan::where('is_active', true)->select('id', 'nama_jurusan')->get()
            : collect();

        return Inertia::render('Admin/Layanan/Form', [
            'layanan' => null,
            'jurusanList' => $jurusanList,
            'isSuperAdmin' => $user->isSuperAdmin(),
            'defaultJurusanId' => $user->jurusan_id,
        ]);
    }

    /**
     * Simpan layanan baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $jurusanId = $user->isSuperAdmin()
            ? $request->input('jurusan_id')
            : $user->jurusan_id;

        $validated = $request->validate([
            'nama_layanan' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:layanan,slug', 'regex:/^[a-z0-9\-]+$/'],
            'url' => ['required', 'url', 'max:255'],
            'deskripsi' => ['nullable', 'string', 'max:1000'],
            'icon_url' => ['nullable', 'string'],
            'tipe_integrasi' => ['required', Rule::in(['sso', 'link_eksternal'])],
            'is_active' => ['boolean'],
            'urutan' => ['required', 'integer', 'min:0'],
            'jurusan_id' => [$user->isSuperAdmin() ? 'required' : 'nullable', 'exists:jurusan,id'],
            'client_id' => [
                'required_if:tipe_integrasi,sso',
                'nullable',
                'string',
                'max:100',
                'unique:sso_clients,client_id',
            ],
            'client_secret' => [
                'required_if:tipe_integrasi,sso',
                'nullable',
                'string',
                'min:8',
            ],
            'redirect_uri' => [
                'required_if:tipe_integrasi,sso',
                'nullable',
                'string',
            ],
        ]);

        $layanan = Layanan::create([
            'jurusan_id' => $jurusanId,
            'nama_layanan' => $validated['nama_layanan'],
            'slug' => Str::slug($validated['slug']),
            'url' => $validated['url'],
            'deskripsi' => $validated['deskripsi'] ?? null,
            'icon_url' => $validated['icon_url'] ?? null,
            'tipe_integrasi' => $validated['tipe_integrasi'],
            'is_active' => $request->boolean('is_active', true),
            'urutan' => (int) ($validated['urutan'] ?? 0),
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);

        AksesLayanan::create([
            'layanan_id' => $layanan->id,
            'role' => 'mahasiswa',
            'jurusan_id' => $jurusanId,
        ]);

        AksesLayanan::create([
            'layanan_id' => $layanan->id,
            'role' => 'admin',
            'jurusan_id' => $jurusanId,
        ]);

        if ($validated['tipe_integrasi'] === 'sso') {
            SsoClient::create([
                'layanan_id' => $layanan->id,
                'client_id' => $validated['client_id'],
                'client_secret' => Hash::make($validated['client_secret']),
                'redirect_uri' => trim($validated['redirect_uri']),
                'is_active' => true,
                'created_by' => $user->id,
            ]);
        }

        return redirect()->route('admin.layanan.index')->with('success', 'Layanan berhasil ditambahkan.');
    }

    /**
     * Form edit layanan.
     */
    public function edit(Request $request, Layanan $layanan): Response
    {
        $user = $request->user();

        if (! $user->canManageJurusan($layanan->jurusan_id)) {
            abort(403);
        }

        $layanan->load(['ssoClient', 'aksesLayanan']);

        $jurusanList = $user->isSuperAdmin()
            ? Jurusan::where('is_active', true)->select('id', 'nama_jurusan')->get()
            : collect();

        return Inertia::render('Admin/Layanan/Form', [
            'layanan' => [
                'id' => $layanan->id,
                'jurusan_id' => $layanan->jurusan_id,
                'nama_layanan' => $layanan->nama_layanan,
                'slug' => $layanan->slug,
                'url' => $layanan->url,
                'deskripsi' => $layanan->deskripsi,
                'icon_url' => $layanan->icon_url,
                'tipe_integrasi' => $layanan->tipe_integrasi,
                'is_active' => (bool) $layanan->is_active,
                'urutan' => (int) $layanan->urutan,
                'sso_client' => $layanan->ssoClient ? [
                    'id' => $layanan->ssoClient->id,
                    'client_id' => $layanan->ssoClient->client_id,
                    'redirect_uri' => $layanan->ssoClient->redirect_uri,
                    'is_active' => (bool) $layanan->ssoClient->is_active,
                ] : null,
            ],
            'jurusanList' => $jurusanList,
            'isSuperAdmin' => $user->isSuperAdmin(),
            'defaultJurusanId' => $layanan->jurusan_id,
        ]);
    }

    /**
     * Perbarui data layanan.
     */
    public function update(Request $request, Layanan $layanan): RedirectResponse
    {
        $user = $request->user();

        if (! $user->canManageJurusan($layanan->jurusan_id)) {
            abort(403);
        }

        $jurusanId = $user->isSuperAdmin()
            ? $request->input('jurusan_id', $layanan->jurusan_id)
            : $layanan->jurusan_id;

        $validated = $request->validate([
            'nama_layanan' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('layanan', 'slug')->ignore($layanan->id),
                'regex:/^[a-z0-9\-]+$/',
            ],
            'url' => ['required', 'url', 'max:255'],
            'deskripsi' => ['nullable', 'string', 'max:1000'],
            'icon_url' => ['nullable', 'string'],
            'tipe_integrasi' => ['required', Rule::in(['sso', 'link_eksternal'])],
            'is_active' => ['boolean'],
            'urutan' => ['required', 'integer', 'min:0'],
            'jurusan_id' => [$user->isSuperAdmin() ? 'required' : 'nullable', 'exists:jurusan,id'],
            'client_id' => [
                'required_if:tipe_integrasi,sso',
                'nullable',
                'string',
                'max:100',
                Rule::unique('sso_clients', 'client_id')->ignore($layanan->ssoClient?->id),
            ],
            'client_secret' => [
                'nullable',
                'string',
                'min:8',
            ],
            'redirect_uri' => [
                'required_if:tipe_integrasi,sso',
                'nullable',
                'string',
            ],
        ]);

        $layanan->update([
            'jurusan_id' => $jurusanId,
            'nama_layanan' => $validated['nama_layanan'],
            'slug' => Str::slug($validated['slug']),
            'url' => $validated['url'],
            'deskripsi' => $validated['deskripsi'] ?? null,
            'icon_url' => $validated['icon_url'] ?? null,
            'tipe_integrasi' => $validated['tipe_integrasi'],
            'is_active' => $request->boolean('is_active', true),
            'urutan' => (int) ($validated['urutan'] ?? 0),
            'updated_by' => $user->id,
        ]);

        if ($validated['tipe_integrasi'] === 'sso') {
            $ssoData = [
                'client_id' => $validated['client_id'],
                'redirect_uri' => trim($validated['redirect_uri']),
                'is_active' => true,
            ];

            if (! empty($validated['client_secret'])) {
                $ssoData['client_secret'] = Hash::make($validated['client_secret']);
            }

            if ($layanan->ssoClient) {
                $layanan->ssoClient->update($ssoData);
            } else {
                $ssoData['client_secret'] = Hash::make($validated['client_secret'] ?? Str::random(32));
                $ssoData['created_by'] = $user->id;
                $layanan->ssoClient()->create($ssoData);
            }
        }

        return redirect()->route('admin.layanan.index')->with('success', 'Layanan berhasil diperbarui.');
    }

    /**
     * Hapus layanan.
     */
    public function destroy(Request $request, Layanan $layanan): RedirectResponse
    {
        $user = $request->user();

        if (! $user->canManageJurusan($layanan->jurusan_id)) {
            abort(403);
        }

        $layanan->delete();

        return redirect()->route('admin.layanan.index')->with('success', 'Layanan berhasil dihapus.');
    }

    /**
     * Ubah status aktif/nonaktif layanan.
     */
    public function toggleStatus(Request $request, Layanan $layanan): RedirectResponse
    {
        $user = $request->user();

        if (! $user->canManageJurusan($layanan->jurusan_id)) {
            abort(403);
        }

        $layanan->is_active = ! $layanan->is_active;
        $layanan->updated_by = $user->id;
        $layanan->save();

        return back()->with('success', 'Status layanan diperbarui.');
    }

    // Deteksi favicon web dan konversi ke base64
    public function detectIcon(Request $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'url' => ['required', 'url'],
        ]);

        $url = $validated['url'];

        try {
            $parsedUrl = parse_url($url);
            $scheme = $parsedUrl['scheme'] ?? 'http';
            $host = $parsedUrl['host'] ?? '';
            $port = isset($parsedUrl['port']) ? ':' . $parsedUrl['port'] : '';
            $origin = "{$scheme}://{$host}{$port}";

            $iconUrl = null;

            // Cek tag link icon di HTML
            $response = \Illuminate\Support\Facades\Http::timeout(3)->get($url);
            if ($response->successful()) {
                $html = $response->body();
                if (preg_match('/<link[^>]+rel=[\'"](?:shortcut )?icon[\'"][^>]+href=[\'"]([^\'"]+)[\'"]/i', $html, $matches)) {
                    $rawHref = $matches[1];
                    if (str_starts_with($rawHref, '//')) {
                        $iconUrl = $scheme . ':' . $rawHref;
                    } elseif (str_starts_with($rawHref, '/')) {
                        $iconUrl = $origin . $rawHref;
                    } elseif (str_starts_with($rawHref, 'http://') || str_starts_with($rawHref, 'https://')) {
                        $iconUrl = $rawHref;
                    } else {
                        $iconUrl = rtrim($origin, '/') . '/' . ltrim($rawHref, '/');
                    }
                }
            }

            // Gunakan path default favicon jika tidak ada di HTML
            if (! $iconUrl) {
                $iconUrl = rtrim($origin, '/') . '/favicon.ico';
            }

            $iconResponse = \Illuminate\Support\Facades\Http::timeout(3)->get($iconUrl);
            if ($iconResponse->successful() && strlen($iconResponse->body()) > 0) {
                $contentType = $iconResponse->header('Content-Type') ?: 'image/x-icon';
                if (str_contains($contentType, 'text') || str_contains($contentType, 'html')) {
                    $contentType = 'image/x-icon';
                }
                $base64 = 'data:' . $contentType . ';base64,' . base64_encode($iconResponse->body());

                return response()->json([
                    'success' => true,
                    'icon_url' => $base64,
                    'message' => 'Ikon web berhasil dideteksi.',
                ]);
            }
        } catch (\Throwable $e) {
            // Tangani error koneksi
        }

        return response()->json([
            'success' => false,
            'message' => 'Ikon tidak ditemukan pada URL tersebut.',
        ], 404);
    }

    /**
     * Preview pencarian global layanan.
     */
    public function searchPreview(Request $request)
    {
        $q = trim((string) $request->input('q', ''));
        if ($q === '') {
            return response()->json([]);
        }

        $user = $request->user();
        $query = Layanan::query();

        // Mahasiswa hanya dapat melihat layanan aktif sesuai jurusannya
        if ($user->role === 'mahasiswa') {
            $query->where('is_active', true);
            if ($user->jurusan_id) {
                $query->where(function ($sub) use ($user) {
                    $sub->whereNull('jurusan_id')
                        ->orWhere('jurusan_id', $user->jurusan_id);
                });
            }
        } elseif ($user->role === 'admin' && $user->jurusan_id) {
            $query->where(function ($sub) use ($user) {
                $sub->whereNull('jurusan_id')
                    ->orWhere('jurusan_id', $user->jurusan_id);
            });
        }

        $results = $query->where(function ($sub) use ($q) {
                $sub->where('nama_layanan', 'like', "%{$q}%")
                    ->orWhere('deskripsi', 'like', "%{$q}%")
                    ->orWhere('slug', 'like', "%{$q}%")
                    ->orWhere('url', 'like', "%{$q}%");
            })
            ->orderBy('urutan', 'asc')
            ->limit(6)
            ->get(['id', 'nama_layanan', 'slug', 'url', 'tipe_integrasi', 'deskripsi', 'icon_url', 'is_active', 'jurusan_id']);

        return response()->json($results);
    }
}

