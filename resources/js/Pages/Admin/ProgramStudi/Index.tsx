import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import TableSkeleton from '@/Components/Skeleton/TableSkeleton';
import { Deferred, Head, Link, router } from '@inertiajs/react';
import { Loader2, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface JurusanItem {
    id: number;
    nama_jurusan: string;
}

interface ProgramStudiItem {
    id: number;
    nama_prodi: string;
    kode_prodi: string | null;
    jenjang: string;
    jurusan_id: number;
    is_active: boolean;
    jurusan?: JurusanItem;
    mahasiswa_count?: number;
}

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    prodiList?: {
        data: ProgramStudiItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
        links: PaginationLinks[];
    };
    jurusanList: JurusanItem[];
    filters: {
        q: string;
        jurusan_id: string;
        status: string;
    };
    canManageAll: boolean;
}

export default function Index({ prodiList, jurusanList, filters, canManageAll }: Props) {
    const [search, setSearch] = useState(filters.q || '');
    const [selectedJurusan, setSelectedJurusan] = useState(filters.jurusan_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [deleteModal, setDeleteModal] = useState<ProgramStudiItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleFilterChange = (newFilters: Partial<typeof filters>) => {
        router.get(
            route('admin.program-studi.index'),
            {
                q: newFilters.q !== undefined ? newFilters.q : search,
                jurusan_id: newFilters.jurusan_id !== undefined ? newFilters.jurusan_id : selectedJurusan,
                status: newFilters.status !== undefined ? newFilters.status : selectedStatus,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSearchSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleFilterChange({ q: search });
    };

    const confirmDelete = () => {
        if (!deleteModal) return;
        setIsDeleting(true);
        router.delete(route('admin.program-studi.destroy', deleteModal.id), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteModal(null);
            },
        });
    };

    const toggleStatus = (item: ProgramStudiItem) => {
        router.patch(route('admin.program-studi.toggle', item.id), {}, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Program Studi" />

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
                                <span className="text-slate-600 dark:text-slate-400 font-medium">Program Studi</span>
                            </nav>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
                                Program Studi
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Daftar program studi dan jenjang akademik yang terdaftar.
                            </p>
                        </div>

                        <div className="flex items-center shrink-0">
                            <Link
                                href={route('admin.program-studi.create')}
                                className="inline-flex items-center gap-1.5 justify-center rounded-xl bg-[#9e1a1a] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#831414] shadow-sm"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Tambah Program Studi</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama atau kode prodi..."
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-1.5 pl-9 pr-8 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9e1a1a]"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        handleFilterChange({ q: '' });
                                    }}
                                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </form>

                        <div className="flex flex-wrap items-center gap-2">
                            {canManageAll && (
                                <select
                                    value={selectedJurusan}
                                    onChange={(e) => {
                                        setSelectedJurusan(e.target.value);
                                        handleFilterChange({ jurusan_id: e.target.value });
                                    }}
                                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-1.5 pl-3 pr-8 text-xs text-slate-700 dark:text-slate-200 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9e1a1a]"
                                >
                                    <option value="">Semua Jurusan</option>
                                    {jurusanList.map((j) => (
                                        <option key={j.id} value={j.id}>{j.nama_jurusan}</option>
                                    ))}
                                </select>
                            )}

                            <select
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value);
                                    handleFilterChange({ status: e.target.value });
                                }}
                                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-1.5 pl-3 pr-8 text-xs text-slate-700 dark:text-slate-200 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9e1a1a]"
                            >
                                <option value="">Semua Status</option>
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Nonaktif</option>
                            </select>
                        </div>
                    </div>
                </div>

                <Deferred data="prodiList" fallback={<TableSkeleton rows={5} cols={7} />}>
                    {prodiList && (
                        <>
                            <div className="w-full max-w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                                <div className="w-full overflow-x-auto">
                                    <table className="w-full min-w-[650px] text-left text-xs text-slate-600 dark:text-slate-300">
                                        <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                                            <tr>
                                                <th className="py-3 px-4 w-12 text-center">No</th>
                                                <th className="py-3 px-4">Program Studi</th>
                                                <th className="py-3 px-4 text-center">Jenjang</th>
                                                <th className="py-3 px-4">Jurusan</th>
                                                <th className="py-3 px-4 text-center">Mahasiswa</th>
                                                <th className="py-3 px-4 text-center">Status</th>
                                                <th className="py-3 px-4 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {prodiList.data.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                                                        Tidak ada data program studi ditemukan.
                                                    </td>
                                                </tr>
                                            ) : (
                                                prodiList.data.map((item, idx) => (
                                                    <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                                                        <td className="py-3 px-4 text-center text-slate-400 dark:text-slate-500">
                                                            {(prodiList.from || 1) + idx}
                                                        </td>
                                                        <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">
                                                            <div className="flex items-center gap-2">
                                                                <span>{item.nama_prodi}</span>
                                                                {item.kode_prodi && (
                                                                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                                                                        {item.kode_prodi}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <span className="inline-block rounded-md bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 text-xs font-semibold text-[#9e1a1a] dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
                                                                {item.jenjang}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                                                            {item.jurusan?.nama_jurusan || '-'}
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <span className="inline-block rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                {item.mahasiswa_count ?? 0}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleStatus(item)}
                                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                                                                    item.is_active
                                                                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/40'
                                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                                                                }`}
                                                            >
                                                                {item.is_active ? 'Aktif' : 'Nonaktif'}
                                                            </button>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <Link
                                                                    href={route('admin.program-studi.edit', item.id)}
                                                                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-2xs"
                                                                    title="Edit"
                                                                    aria-label="Edit"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Link>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setDeleteModal(item)}
                                                                    className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-800 p-1.5 text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shadow-2xs"
                                                                    title="Hapus"
                                                                    aria-label="Hapus"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <Pagination
                                from={prodiList.from}
                                to={prodiList.to}
                                total={prodiList.total}
                                links={prodiList.links}
                            />
                        </>
                    )}
                </Deferred>
            </div>

            {/* Modal Hapus */}
            {deleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                        <div className="flex items-center gap-3.5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
                                <Trash2 className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Hapus Program Studi</h3>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            Apakah Anda yakin ingin menghapus program studi &ldquo;{deleteModal.nama_prodi}&rdquo;?
                        </p>
                        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setDeleteModal(null)}
                                className="rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={confirmDelete}
                                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50 shadow-sm"
                            >
                                {isDeleting && (
                                    <Loader2 className="animate-spin h-4 w-4 text-white" />
                                )}
                                <span>{isDeleting ? 'Menghapus...' : 'Hapus'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
