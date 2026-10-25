<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuthLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    // Tampilkan daftar log autentikasi & keamanan
    public function index(Request $request): Response
    {
        if (! $request->user()->isSuperAdmin()) {
            abort(403, 'Akses terbatas untuk Super Admin.');
        }

        $query = AuthLog::query()
            ->with('user')
            ->orderBy('id', 'desc');

        if ($request->filled('q')) {
            $search = $request->input('q');
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        if ($request->filled('event')) {
            $query->where('event', $request->input('event'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        return Inertia::render('Admin/AuditLogs/Index', [
            'logs' => Inertia::defer(fn () => $query->paginate(15)->withQueryString()),
            'filters' => [
                'q' => $request->input('q', ''),
                'event' => $request->input('event', ''),
                'status' => $request->input('status', ''),
            ],
        ]);
    }
}
