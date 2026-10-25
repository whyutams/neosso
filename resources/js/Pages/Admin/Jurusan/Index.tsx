import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import Pagination from '@/Components/Pagination';
import TableSkeleton from '@/Components/Skeleton/TableSkeleton';
import { Deferred, Head, Link, router } from '@inertiajs/react';
import { Loader2, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Jurusan, PageProps } from '@/types';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedJurusan {
    data: Jurusan[];
    links: PaginationLink[];
    total: number;
    from: number | null;
    to: number | null;
}

interface Props extends PageProps {
    jurusanList?: PaginatedJurusan;
    filters: {
        q?: string;
        status?: string;
    };
    canCreate?: boolean;
    canDelete?: boolean;
    canToggle?: boolean;
}

export default function Index({
    jurusanList,
    filters,
    canCreate = false,
    canDelete = false,
    canToggle = false,
}: Props) {
    const [search, setSearch] = useState(filters.q || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [deleteModal, setDeleteModal] = useState<{ id: number; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleFilterChange = (params: { q?: string; status?: string }) => {
        router.get(
            route('admin.jurusan.index'),
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

    const handleToggleStatus = (item: Jurusan) => {
        router.patch(route('admin.jurusan.toggle', item.id), {}, {
            preserveScroll: true,
        });
    };

    const confirmDelete = () => {
        if (!deleteModal) return;
        setIsDeleting(true);
        router.delete(route('admin.jurusan.destroy', deleteModal.id), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteModal(null);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Jurusan" />

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
                                <span className="text-slate-600 dark:text-slate-400 font-medium">Jurusan</span>
                            </nav>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
                                Jurusan
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Daftar jurusan dan unit kerja di lingkungan universitas.
                            </p>
                        </div>

                        {canCreate && (
                            <div className="flex items-center shrink-0">
                                <Link
                                    href={route('admin.jurusan.create')}
                                    className="inline-flex items-center gap-1.5 justify-center rounded-lg bg-[#9e1a1a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#831414] shadow-sm"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Tambah Jurusan</span>
                                </Link>
                            </div>
                        )}
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
                                placeholder="Cari nama jurusan..."
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-2.5 pl-10 pr-9 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9e1a1a]"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        handleFilterChange({ q: '' });
                                    }}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-2.5 pl-3.5 pr-8 text-sm text-slate-700 dark:text-slate-200 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9e1a1a]"
                            >
                                <option value="">Semua Status</option>
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Nonaktif</option>
                            </select>
                        </div>
                    </div>
                </div>

                <Deferred data="jurusanList" fallback={<TableSkeleton rows={5} cols={8} />}>
                    {jurusanList && (
                        <>
                            <div className="w-full max-w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                                <div className="w-full overflow-x-auto">
                                    <table className="w-full min-w-[700px] text-left text-sm text-slate-600 dark:text-slate-300">
                                        <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                                            <tr>
                                                <th className="py-3.5 px-4 w-12 text-center">No</th>
                                                <th className="py-3.5 px-4">Nama Jurusan</th>
                                                <th className="py-3.5 px-4 text-center">Program Studi</th>
                                                <th className="py-3.5 px-4 text-center">Admin</th>
                                                <th className="py-3.5 px-4 text-center">Mahasiswa</th>
                                                <th className="py-3.5 px-4 text-center">Layanan</th>
                                                <th className="py-3.5 px-4 text-center">Status</th>
                                                <th className="py-3.5 px-4 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {jurusanList.data.length > 0 ? (
                                                jurusanList.data.map((item, idx) => (
                                                    <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                                                        <td className="py-3.5 px-4 text-center text-sm text-slate-400 dark:text-slate-500">
                                                            {(jurusanList.from || 1) + idx}
                                                        </td>
                                                        <td className="py-3.5 px-4 font-semibold text-sm text-slate-800 dark:text-slate-100">
                                                            {item.nama_jurusan}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-center">
                                                            <span className="inline-block rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                {(item as any).program_studi_count ?? 0}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-center">
                                                            <span className="inline-block rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                {item.admins_count ?? 0}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-center">
                                                            <span className="inline-block rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                {item.mahasiswa_count ?? 0}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-center">
                                                            <span className="inline-block rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                {item.layanan_count ?? 0}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-center">
                                                            {canToggle ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleToggleStatus(item)}
                                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                                                                        item.is_active
                                                                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/40'
                                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                                                                    }`}
                                                                >
                                                                    {item.is_active ? 'Aktif' : 'Nonaktif'}
                                                                </button>
                                                            ) : (
                                                                <span
                                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                                        item.is_active
                                                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                                    }`}
                                                                >
                                                                    {item.is_active ? 'Aktif' : 'Nonaktif'}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Link
                                                                    href={route('admin.jurusan.edit', item.id)}
                                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-2xs"
                                                                    title="Edit"
                                                                    aria-label="Edit"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Link>
                                                                {canDelete && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setDeleteModal({ id: item.id, name: item.nama_jurusan })}
                                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-800 text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shadow-2xs"
                                                                        title="Hapus"
                                                                        aria-label="Hapus"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                                                        Tidak ada data jurusan ditemukan.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <Pagination
                                from={jurusanList.from}
                                to={jurusanList.to}
                                total={jurusanList.total}
                                links={jurusanList.links}
                            />
                        </>
                    )}
                </Deferred>
            </div>

            {/* Modal Konfirmasi Hapus */}
            <ConfirmModal
                show={Boolean(deleteModal)}
                title="Hapus Jurusan"
                message={
                    <>
                        Apakah Anda yakin ingin menghapus jurusan &ldquo;{deleteModal?.name}&rdquo;?
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
