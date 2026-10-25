import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import TableSkeleton from '@/Components/Skeleton/TableSkeleton';
import { Deferred, Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { Plus, Search, X, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Jurusan, PageProps, User } from '@/types';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedUsers {
    data: User[];
    links: PaginationLink[];
    total: number;
    from: number | null;
    to: number | null;
}

interface ProdiItem {
    id: number;
    jurusan_id: number;
    nama_prodi: string;
    jenjang: string;
}

interface Props extends PageProps {
    users?: PaginatedUsers;
    jurusanList: Jurusan[];
    prodiList: ProdiItem[];
    filters: {
        q?: string;
        role?: string;
        jurusan_id?: string;
        status?: string;
    };
    canManageAdmins: boolean;
}

export default function Index({ users, jurusanList, prodiList, filters, auth }: Props) {
    const [search, setSearch] = useState(filters.q || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || '');
    const [selectedJurusan, setSelectedJurusan] = useState(filters.jurusan_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [deleteModal, setDeleteModal] = useState<{ id: number; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleFilterChange = (params: { q?: string; role?: string; jurusan_id?: string; status?: string }) => {
        router.get(
            route('admin.users.index'),
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

    const handleToggleStatus = (item: User) => {
        router.patch(route('admin.users.toggle', item.id), {}, {
            preserveScroll: true,
        });
    };

    const confirmDelete = () => {
        if (!deleteModal) return;
        setIsDeleting(true);
        router.delete(route('admin.users.destroy', deleteModal.id), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteModal(null);
            },
        });
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'superadmin':
                return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60';
            case 'admin':
                return 'bg-rose-50 text-[#9e1a1a] border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60';
            case 'mahasiswa':
                return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'superadmin':
                return 'Super Admin';
            case 'admin':
                return 'Admin Jurusan';
            case 'mahasiswa':
                return 'Mahasiswa';
            default:
                return role;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pengguna" />
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
                                <span className="text-slate-600 dark:text-slate-400 font-medium">Pengguna</span>
                            </nav>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
                                Pengguna
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Kelola data pengguna, hak akses, dan status akun SSO.
                            </p>
                        </div>

                        <div className="flex items-center shrink-0">
                            <Link
                                href={route('admin.users.create')}
                                className="inline-flex items-center gap-1.5 justify-center rounded-xl bg-[#9e1a1a] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#831414] shadow-sm"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Tambah Pengguna</span>
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
                                placeholder="Cari nama, email, atau NIM..."
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-1.5 pl-9 pr-8 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9e1a1a]"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        handleFilterChange({ q: '' });
                                    }}
                                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </form>

                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                value={selectedRole}
                                onChange={(e) => {
                                    setSelectedRole(e.target.value);
                                    handleFilterChange({ role: e.target.value });
                                }}
                                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-1.5 pl-3 pr-8 text-xs text-slate-700 dark:text-slate-200 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9e1a1a]"
                            >
                                <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Semua Peran</option>
                                <option value="superadmin" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Super Admin</option>
                                <option value="admin" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Admin Jurusan</option>
                                <option value="mahasiswa" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Mahasiswa</option>
                            </select>

                            <select
                                value={selectedJurusan}
                                onChange={(e) => {
                                    setSelectedJurusan(e.target.value);
                                    handleFilterChange({ jurusan_id: e.target.value });
                                }}
                                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-1.5 pl-3 pr-8 text-xs text-slate-700 dark:text-slate-200 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9e1a1a]"
                            >
                                <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Semua Jurusan</option>
                                {jurusanList.map((jur) => (
                                    <option key={jur.id} value={jur.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{jur.nama_jurusan}</option>
                                ))}
                            </select>

                            <select
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value);
                                    handleFilterChange({ status: e.target.value });
                                }}
                                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-1.5 pl-3 pr-8 text-xs text-slate-700 dark:text-slate-200 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9e1a1a]"
                            >
                                <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Semua Status</option>
                                <option value="aktif" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Aktif</option>
                                <option value="nonaktif" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Nonaktif</option>
                            </select>
                        </div>
                    </div>
                </div>

                <Deferred data="users" fallback={<TableSkeleton columns={8} rows={8} />}>
                    {users && (
                        <>
                            <div className="w-full max-w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                                <div className="w-full overflow-x-auto">
                                    <table className="w-full min-w-[720px] text-left text-xs text-slate-600 dark:text-slate-300">
                                        <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                            <tr>
                                                <th className="py-3 px-4 w-12 text-center">No</th>
                                                <th className="py-3 px-4">Pengguna</th>
                                                <th className="py-3 px-4">Peran</th>
                                                <th className="py-3 px-4">Jurusan</th>
                                                <th className="py-3 px-4 text-center">NIM</th>
                                                <th className="py-3 px-4 text-center">Angkatan</th>
                                                <th className="py-3 px-4 text-center">Status</th>
                                                <th className="py-3 px-4 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                            {users.data.length > 0 ? (
                                                users.data.map((item, idx) => {
                                                    const isSelf = item.id === auth.user.id;
                                                    return (
                                                        <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition">
                                                            <td className="py-3 px-4 text-center text-slate-400 dark:text-slate-500">
                                                                {(users.from || 1) + idx}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                                                                    <span>{item.name}</span>
                                                                    {isSelf && (
                                                                        <span className="rounded bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900 px-1.5 py-0.2 text-[10px] font-semibold text-[#9e1a1a] dark:text-rose-400">
                                                                            Anda
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-[11px] text-slate-400 dark:text-slate-500">{item.email}</div>
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${getRoleBadge(item.role)}`}>
                                                                    {getRoleLabel(item.role)}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                                                                <div>{item.jurusan?.nama_jurusan || '-'}</div>
                                                                {(item as any).program_studi && (
                                                                    <div className="text-[11px] text-slate-400 dark:text-slate-500">
                                                                        {(item as any).program_studi.jenjang} {(item as any).program_studi.nama_prodi}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium">
                                                                {item.nim || '-'}
                                                            </td>
                                                            <td className="py-3 px-4 text-center text-slate-700 dark:text-slate-300">
                                                                {item.angkatan || '-'}
                                                            </td>
                                                            <td className="py-3 px-4 text-center">
                                                                <button
                                                                    type="button"
                                                                    disabled={isSelf}
                                                                    onClick={() => handleToggleStatus(item)}
                                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold transition ${
                                                                        item.is_active
                                                                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                                    } ${isSelf ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                                                                >
                                                                    {item.is_active ? 'Aktif' : 'Nonaktif'}
                                                                </button>
                                                            </td>
                                                            <td className="py-3 px-4 text-right">
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    <Link
                                                                        href={route('admin.users.edit', item.id)}
                                                                        className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-2xs"
                                                                        title="Edit"
                                                                        aria-label="Edit"
                                                                    >
                                                                        <Pencil className="h-3.5 w-3.5" />
                                                                    </Link>
                                                                    {!isSelf && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setDeleteModal({ id: item.id, name: item.name })}
                                                                            className="rounded-lg border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-slate-800 p-1.5 text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shadow-2xs"
                                                                            title="Hapus"
                                                                            aria-label="Hapus"
                                                                        >
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                                                        Tidak ada data pengguna ditemukan.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <Pagination
                                from={users.from}
                                to={users.to}
                                total={users.total}
                                links={users.links}
                            />
                        </>
                    )}
                </Deferred>
            </div>

            {/* Modal Konfirmasi Hapus */}
            {deleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                        <div className="flex items-center gap-3.5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50">
                                <Trash2 className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Hapus Pengguna</h3>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            Apakah Anda yakin ingin menghapus pengguna &ldquo;{deleteModal.name}&rdquo;?
                        </p>
                        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setDeleteModal(null)}
                                className="rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={confirmDelete}
                                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50 shadow-sm"
                            >
                                {isDeleting && <Loader2 className="animate-spin h-4 w-4 text-white" />}
                                <span>{isDeleting ? 'Menghapus...' : 'Hapus'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
