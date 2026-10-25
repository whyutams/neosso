import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import TableSkeleton from '@/Components/Skeleton/TableSkeleton';
import { Deferred, Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { Search, X } from 'lucide-react';
import { AuthLog, PageProps } from '@/types';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedLogs {
    data: AuthLog[];
    links: PaginationLink[];
    total: number;
    from: number | null;
    to: number | null;
}

interface Props extends PageProps {
    logs?: PaginatedLogs;
    filters: {
        q?: string;
        event?: string;
        status?: string;
    };
}

export default function Index({ logs, filters }: Props) {
    const [search, setSearch] = useState(filters.q || '');
    const [selectedEvent, setSelectedEvent] = useState(filters.event || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [detailLog, setDetailLog] = useState<AuthLog | null>(null);

    const handleFilterChange = (params: { q?: string; event?: string; status?: string }) => {
        router.get(
            route('admin.audit-logs.index'),
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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-500/30';
            case 'failed':
                return 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400 dark:ring-rose-500/30';
            case 'blocked':
                return 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-500/30';
            default:
                return 'bg-slate-100 text-slate-700 ring-1 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'success':
                return 'Sukses';
            case 'failed':
                return 'Gagal';
            case 'blocked':
                return 'Diblokir';
            default:
                return status;
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Audit Log" />

            <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
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
                                <span className="text-slate-600 dark:text-slate-400 font-medium">Audit Log</span>
                            </nav>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                                Audit Log
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Catatan riwayat autentikasi dan aktivitas keamanan sistem SSO.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari email, IP address, atau pesan..."
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-1.5 pl-9 pr-8 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9e1a1a]"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        handleFilterChange({ q: '' });
                                    }}
                                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </form>

                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                value={selectedEvent}
                                onChange={(e) => {
                                    setSelectedEvent(e.target.value);
                                    handleFilterChange({ event: e.target.value });
                                }}
                                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-1.5 pl-3 pr-8 text-xs text-slate-700 dark:text-slate-200 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9e1a1a]"
                            >
                                <option value="">Semua Event</option>
                                <option value="login">Login</option>
                                <option value="logout">Logout</option>
                                <option value="failed_login">Failed Login</option>
                                <option value="oauth_google">OAuth Google</option>
                            </select>

                            <select
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value);
                                    handleFilterChange({ status: e.target.value });
                                }}
                                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-1.5 pl-3 pr-8 text-xs text-slate-700 dark:text-slate-200 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9e1a1a]"
                            >
                                <option value="">Semua Status</option>
                                <option value="success">Sukses</option>
                                <option value="failed">Gagal</option>
                                <option value="blocked">Diblokir</option>
                            </select>
                        </div>
                    </div>
                </div>

                <Deferred data="logs" fallback={<TableSkeleton columns={7} rows={8} />}>
                    {logs && (
                        <>
                            <div className="w-full max-w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                                <div className="w-full overflow-x-auto">
                                    <table className="w-full min-w-[700px] text-left text-xs">
                                        <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                                            <tr>
                                                <th className="py-3 px-4 w-12 text-center">No</th>
                                                <th className="py-3 px-4">Waktu</th>
                                                <th className="py-3 px-4">Pengguna / Email</th>
                                                <th className="py-3 px-4">Event</th>
                                                <th className="py-3 px-4">IP Address</th>
                                                <th className="py-3 px-4 text-center">Status</th>
                                                <th className="py-3 px-4 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                            {logs.data.length > 0 ? (
                                                logs.data.map((item, index) => (
                                                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                                                        <td className="py-3 px-4 text-center text-slate-400 dark:text-slate-500">
                                                            {(logs.from || 1) + index}
                                                        </td>
                                                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                            {formatDate(item.created_at)}
                                                        </td>
                                                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                                                            <div>
                                                                <p>{item.user?.name || item.email || '-'}</p>
                                                                {item.user?.email && item.user?.name && (
                                                                    <p className="text-[11px] text-slate-400 font-normal">{item.user.email}</p>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                                {item.event}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                                                            {item.ip_address || '-'}
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                                                                {getStatusLabel(item.status)}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <button
                                                                type="button"
                                                                onClick={() => setDetailLog(item)}
                                                                className="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
                                                            >
                                                                Detail
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                                                        Tidak ada riwayat log ditemukan.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <Pagination
                                from={logs.from}
                                to={logs.to}
                                total={logs.total}
                                links={logs.links}
                            />
                        </>
                    )}
                </Deferred>
            </div>

            {/* Modal Detail Log */}
            {detailLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" onClick={() => setDetailLog(null)} />
                    <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Detail Log Keamanan</h3>
                            <button
                                type="button"
                                onClick={() => setDetailLog(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg p-1 transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-4 space-y-3 text-sm">
                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Waktu</span>
                                <span className="text-slate-900 dark:text-white font-semibold">{formatDate(detailLog.created_at)}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Pengguna</span>
                                <span className="text-slate-900 dark:text-white font-semibold">{detailLog.user?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Email</span>
                                <span className="text-slate-900 dark:text-white font-medium">{detailLog.email || detailLog.user?.email || '-'}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Event</span>
                                <span className="text-slate-900 dark:text-white font-semibold">{detailLog.event}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Status</span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(detailLog.status)}`}>
                                    {getStatusLabel(detailLog.status)}
                                </span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">IP Address</span>
                                <span className="text-slate-900 dark:text-white font-medium">{detailLog.ip_address || '-'}</span>
                            </div>
                            <div className="py-1.5 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-500 dark:text-slate-400 font-medium block mb-1">User Agent</span>
                                <span className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 block break-all text-xs leading-relaxed">
                                    {detailLog.user_agent || '-'}
                                </span>
                            </div>
                            {detailLog.message && (
                                <div className="py-1.5">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium block mb-1">Pesan</span>
                                    <span className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 block text-xs leading-relaxed">
                                        {detailLog.message}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setDetailLog(null)}
                                className="rounded-xl bg-slate-100 dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

