import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import Pagination from '@/Components/Pagination';
import TableSkeleton from '@/Components/Skeleton/TableSkeleton';
import { Deferred, Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import {
    Plus,
    Search,
    X,
    Copy,
    Check,
    Eye,
    EyeOff,
    RefreshCw,
    Pencil,
    Trash2,
    Loader2,
    AlertTriangle,
} from 'lucide-react';
import { PageProps } from '@/types';

interface Layanan {
    id: number;
    nama_layanan: string;
    url: string;
}

interface SsoClient {
    id: number;
    layanan_id: number;
    client_id: string;
    client_secret: string;
    redirect_uri: string;
    is_active: boolean;
    created_at: string;
    layanan?: Layanan;
    creator?: {
        name: string;
    };
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedClients {
    data: SsoClient[];
    links: PaginationLink[];
    total: number;
    from: number | null;
    to: number | null;
}

interface Props extends PageProps {
    clients?: PaginatedClients;
    availableLayanan: Layanan[];
    filters: {
        q?: string;
        status?: string;
    };
}

export default function Index({ clients, availableLayanan, filters }: Props) {
    const [search, setSearch] = useState(filters.q || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [visibleSecret, setVisibleSecret] = useState<number | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const [deleteModal, setDeleteModal] = useState<{ id: number; client_id: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [secretModal, setSecretModal] = useState<{ id: number; client_id: string } | null>(null);
    const [isRegenerating, setIsRegenerating] = useState(false);

    const handleFilterChange = (params: { q?: string; status?: string }) => {
        router.get(
            route('admin.sso-clients.index'),
            {
                ...filters,
                ...params,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleSearchSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleFilterChange({ q: search });
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleToggleStatus = (item: SsoClient) => {
        router.patch(route('admin.sso-clients.toggle', item.id), {}, {
            preserveScroll: true,
        });
    };

    const confirmDelete = () => {
        if (!deleteModal) return;
        setIsDeleting(true);
        router.delete(route('admin.sso-clients.destroy', deleteModal.id), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteModal(null);
            },
        });
    };

    const confirmRegenerateSecret = () => {
        if (!secretModal) return;
        setIsRegenerating(true);
        router.post(route('admin.sso-clients.secret', secretModal.id), {}, {
            onFinish: () => {
                setIsRegenerating(false);
                setSecretModal(null);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Klien SSO" />

            <div className="space-y-6">
                <div className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <nav className="flex items-center gap-1.5 text-xs">
                                <Link
                                    href={route('dashboard')}
                                    className="font-semibold text-[#9e1a1a] hover:underline"
                                >
                                    Dashboard
                                </Link>
                                <span className="text-slate-400 dark:text-slate-600">/</span>
                                <span className="text-slate-600 dark:text-slate-400 font-medium">Klien SSO</span>
                            </nav>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
                                Klien SSO
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Manajemen aplikasi klien OAuth 2.0 dan kredensial akses.
                            </p>
                        </div>

                        <div className="flex items-center shrink-0">
                            <Link
                                href={route('admin.sso-clients.create')}
                                className={`inline-flex items-center gap-1.5 justify-center rounded-lg bg-[#9e1a1a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#831414] shadow-sm ${
                                    availableLayanan.length === 0 ? 'opacity-50 pointer-events-none' : ''
                                }`}
                                title={availableLayanan.length === 0 ? 'Semua layanan sudah terdaftar memiliki Klien SSO' : undefined}
                            >
                                <Plus className="h-4 w-4" />
                                <span>Tambah Klien SSO</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari Client ID atau Layanan..."
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 pl-10 pr-9 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9e1a1a]"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        handleFilterChange({ q: '' });
                                    }}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </form>

                        <div className="flex items-center gap-2">
                            <select
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value);
                                    handleFilterChange({ status: e.target.value });
                                }}
                                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 pl-3.5 pr-8 text-sm text-slate-700 dark:text-slate-200 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9e1a1a]"
                            >
                                <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Semua Status</option>
                                <option value="aktif" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Aktif</option>
                                <option value="nonaktif" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Nonaktif</option>
                            </select>
                        </div>
                    </div>
                </div>

                <Deferred data="clients" fallback={<TableSkeleton columns={7} rows={6} />}>
                    {clients && (
                        <>
                            <div className="w-full max-w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                                <div className="w-full overflow-x-auto">
                                    <table className="w-full min-w-[750px] text-left text-sm text-slate-600 dark:text-slate-300">
                                        <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                            <tr>
                                                <th className="py-3.5 px-4 w-12 text-center">No</th>
                                                <th className="py-3.5 px-4">Layanan</th>
                                                <th className="py-3.5 px-4">Client ID</th>
                                                <th className="py-3.5 px-4">Client Secret</th>
                                                <th className="py-3.5 px-4">Callback URI</th>
                                                <th className="py-3.5 px-4 text-center">Status</th>
                                                <th className="py-3.5 px-4 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                            {clients.data.length > 0 ? (
                                                clients.data.map((item, idx) => (
                                                <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition">
                                                    <td className="py-3.5 px-4 text-center text-slate-400 dark:text-slate-500">
                                                        {(clients.from || 1) + idx}
                                                    </td>
                                                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-100">
                                                        <div>{item.layanan?.nama_layanan || 'Layanan Dihapus'}</div>
                                                        <div className="text-xs text-slate-400 dark:text-slate-500 font-normal">
                                                            {item.layanan?.url}
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-slate-800 dark:text-slate-200 font-medium">
                                                                {item.client_id}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopy(item.client_id, `id-${item.id}`)}
                                                                className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                                                title="Salin Client ID"
                                                            >
                                                                {copiedId === `id-${item.id}` ? (
                                                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Tersalin</span>
                                                                ) : (
                                                                    <Copy className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-slate-600 dark:text-slate-300">
                                                                {visibleSecret === item.id ? item.client_secret : '••••••••••••••••'}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setVisibleSecret(visibleSecret === item.id ? null : item.id)}
                                                                className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                                                title={visibleSecret === item.id ? 'Sembunyikan' : 'Tampilkan Secret'}
                                                            >
                                                                {visibleSecret === item.id ? (
                                                                    <EyeOff className="h-4 w-4" />
                                                                ) : (
                                                                    <Eye className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopy(item.client_secret, `sec-${item.id}`)}
                                                                className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                                                title="Salin Secret"
                                                            >
                                                                {copiedId === `sec-${item.id}` ? (
                                                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Tersalin</span>
                                                                ) : (
                                                                    <Copy className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setSecretModal({ id: item.id, client_id: item.client_id })}
                                                                className="rounded p-1 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                                                                title="Buat Ulang Secret"
                                                            >
                                                                <RefreshCw className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600 dark:text-slate-300" title={item.redirect_uri}>
                                                        {item.redirect_uri.split('\n')[0]}
                                                        {item.redirect_uri.split('\n').length > 1 && (
                                                            <span className="ml-1 text-xs text-slate-400 dark:text-slate-500 font-semibold">
                                                                (+{item.redirect_uri.split('\n').length - 1})
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleStatus(item)}
                                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                                                                item.is_active
                                                                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                            }`}
                                                        >
                                                            {item.is_active ? 'Aktif' : 'Nonaktif'}
                                                        </button>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link
                                                                href={route('admin.sso-clients.edit', item.id)}
                                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-2xs"
                                                                title="Edit"
                                                                aria-label="Edit"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                onClick={() => setDeleteModal({ id: item.id, client_id: item.client_id })}
                                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-slate-800 text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shadow-2xs"
                                                                title="Hapus"
                                                                aria-label="Hapus"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                                                    Tidak ada data klien SSO ditemukan.
                                                </td>
                                            </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <Pagination
                                from={clients.from}
                                to={clients.to}
                                total={clients.total}
                                links={clients.links}
                            />
                        </>
                    )}
                </Deferred>
            </div>

            {/* Modal Konfirmasi Regenerate Secret */}
            <ConfirmModal
                show={Boolean(secretModal)}
                title="Buat Ulang Client Secret"
                message="Aplikasi terkait perlu memperbarui kredensial secret baru agar autentikasi SSO tetap berjalan. Lanjutkan?"
                confirmText="Buat Ulang"
                cancelText="Batal"
                isProcessing={isRegenerating}
                onConfirm={confirmRegenerateSecret}
                onClose={() => setSecretModal(null)}
                icon={<AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
            />

            {/* Modal Konfirmasi Hapus */}
            <ConfirmModal
                show={Boolean(deleteModal)}
                title="Hapus Klien SSO"
                message={
                    <>
                        Apakah Anda yakin ingin menghapus kredensial klien &ldquo;{deleteModal?.client_id}&rdquo;?
                    </>
                }
                confirmText="Hapus"
                cancelText="Batal"
                isProcessing={isDeleting}
                onConfirm={confirmDelete}
                onClose={() => setDeleteModal(null)}
            />
        </AuthenticatedLayout>
    );
}
