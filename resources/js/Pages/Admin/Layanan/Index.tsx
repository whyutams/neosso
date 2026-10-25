import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CardSkeleton from '@/Components/Skeleton/CardSkeleton';
import { Deferred, Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Plus,
    Search,
    X,
    ExternalLink,
    Pencil,
    Trash2,
    Loader2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Jurusan, Layanan, PageProps } from '@/types';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedLayanan {
    data: Layanan[];
    links: PaginationLink[];
    total: number;
    from: number | null;
    to: number | null;
}

interface Props extends PageProps {
    layananList?: PaginatedLayanan;
    filters: {
        q?: string;
        tipe?: string;
        status?: string;
        jurusan_id?: string;
    };
    jurusanList: Jurusan[];
    isSuperAdmin: boolean;
    currentJurusan?: Jurusan | null;
}

export default function Index({
    layananList,
    filters,
    jurusanList,
    isSuperAdmin,
    currentJurusan,
}: Props) {
    const [search, setSearch] = useState(filters.q || '');
    const [selectedTipe, setSelectedTipe] = useState(filters.tipe || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [deleteModal, setDeleteModal] = useState<{ slug: string; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleFilterChange = (params: { q?: string; tipe?: string; status?: string; jurusan_id?: string }) => {
        router.get(
            route('admin.layanan.index'),
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

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange({ q: search });
    };

    const confirmDelete = () => {
        if (!deleteModal) return;
        setIsDeleting(true);
        router.delete(route('admin.layanan.destroy', deleteModal.slug), {
            onSuccess: () => {
                setDeleteModal(null);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Layanan" />

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
                                <span className="text-slate-600 dark:text-slate-400 font-medium">Layanan</span>
                            </nav>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
                                Layanan
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Katalog layanan digital terintegrasi dalam ekosistem SSO UNG.
                            </p>
                        </div>

                        <div className="flex items-center shrink-0">
                            <Link
                                href={route('admin.layanan.create')}
                                className="inline-flex items-center gap-1.5 justify-center rounded-xl bg-[#9e1a1a] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#831414] shadow-sm"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Tambah Layanan</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari layanan..."
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 py-2 pl-10 pr-8 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9e1a1a]"
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

                        <div className="flex flex-wrap items-center gap-2.5">
                            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 p-1 bg-slate-50 dark:bg-slate-800 text-xs">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedTipe('');
                                        handleFilterChange({ tipe: '' });
                                    }}
                                    className={`rounded-lg px-3 py-1 font-medium transition ${
                                        selectedTipe === ''
                                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                >
                                    Semua
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedTipe('sso');
                                        handleFilterChange({ tipe: 'sso' });
                                    }}
                                    className={`rounded-lg px-3 py-1 font-medium transition ${
                                        selectedTipe === 'sso'
                                            ? 'bg-white dark:bg-slate-900 text-[#9e1a1a] dark:text-rose-400 shadow-sm font-semibold'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                >
                                    SSO
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedTipe('link_eksternal');
                                        handleFilterChange({ tipe: 'link_eksternal' });
                                    }}
                                    className={`rounded-lg px-3 py-1 font-medium transition ${
                                        selectedTipe === 'link_eksternal'
                                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                >
                                    Eksternal
                                </button>
                            </div>

                            <select
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value);
                                    handleFilterChange({ status: e.target.value });
                                }}
                                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-3.5 pr-9 text-xs text-slate-700 dark:text-slate-200 focus:border-[#9e1a1a] focus:outline-none focus:ring-1 focus:ring-[#9e1a1a]"
                            >
                                <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Semua Status</option>
                                <option value="aktif" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Aktif</option>
                                <option value="nonaktif" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Nonaktif</option>
                            </select>

                            {isSuperAdmin && jurusanList.length > 0 && (
                                <select
                                    value={filters.jurusan_id || ''}
                                    onChange={(e) => handleFilterChange({ jurusan_id: e.target.value })}
                                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-3.5 pr-9 text-xs text-slate-700 dark:text-slate-200 focus:border-[#9e1a1a] focus:outline-none focus:ring-1 focus:ring-[#9e1a1a] max-w-[220px]"
                                >
                                    <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Semua Jurusan</option>
                                    {jurusanList.map((j) => (
                                        <option key={j.id} value={j.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                                            {j.nama_jurusan}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                </div>

                <Deferred data="layananList" fallback={<CardSkeleton count={8} />}>
                    {!layananList || layananList.data.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Tidak ada data layanan.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {layananList.data.map((item) => {
                                    const isSso = item.tipe_integrasi === 'sso';
                                    const badgeText = isSso ? 'SSO' : 'Eksternal';

                                    return (
                                        <div
                                            key={item.id}
                                            className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all duration-200 hover:border-[#9e1a1a]/30 dark:hover:border-rose-900/50 hover:shadow-md"
                                        >
                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/50 text-[#9e1a1a] dark:text-rose-400 font-bold text-xs border border-rose-100 dark:border-rose-900/50 overflow-hidden">
                                                        {item.icon_url ? (
                                                            <img
                                                                src={item.icon_url}
                                                                alt={item.nama_layanan}
                                                                className="h-7 w-7 object-contain"
                                                                onError={(e) => {
                                                                    (e.target as HTMLElement).style.display = 'none';
                                                                }}
                                                            />
                                                        ) : (
                                                            item.nama_layanan.slice(0, 2).toUpperCase()
                                                        )}
                                                    </div>

                                                    <span
                                                        className={`rounded-lg px-2.5 py-1 text-[10px] font-bold border ${
                                                            isSso
                                                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60'
                                                                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                                        }`}
                                                    >
                                                        {badgeText}
                                                    </span>
                                                </div>

                                                <h3 className="mt-3.5 text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#9e1a1a] dark:group-hover:text-rose-400 line-clamp-1">
                                                    {item.nama_layanan}
                                                </h3>
                                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                                    {item.deskripsi || 'Layanan terintegrasi Universitas Negeri Gorontalo.'}
                                                </p>
                                            </div>

                                            <div className="mt-4 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                                                <a
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#9e1a1a] py-2 text-xs font-semibold text-white shadow-sm transition-colors duration-200 ease-in-out hover:bg-[#831414]"
                                                >
                                                    <span>Buka</span>
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </a>

                                                <Link
                                                    href={route('admin.layanan.edit', item.slug)}
                                                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                                                    title="Edit Layanan"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteModal({ slug: item.slug, name: item.nama_layanan })}
                                                    className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-slate-800 p-2 text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                                                    title="Hapus Layanan"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {layananList.from || (layananList.total > 0 ? 1 : 0)} - {layananList.to || layananList.total} dari {layananList.total}
                                </p>
                                <div className="flex items-center gap-1">
                                    {layananList.links && layananList.links.length > 0 ? (
                                        layananList.links.map((link, idx) => {
                                            const isPrev =
                                                idx === 0 ||
                                                link.label.toLowerCase().includes('prev') ||
                                                link.label.includes('&laquo;') ||
                                                link.label.includes('«');
                                            const isNext =
                                                idx === layananList.links.length - 1 ||
                                                link.label.toLowerCase().includes('next') ||
                                                link.label.includes('&raquo;') ||
                                                link.label.includes('»');
                                            const cleanLabel = link.label.replace(/&laquo;|&raquo;|«|»/g, '').trim();

                                            const isArrow = isPrev || isNext;
                                            const title = isPrev ? 'Sebelumnya' : isNext ? 'Berikutnya' : `Halaman ${cleanLabel}`;

                                            const content = isPrev ? (
                                                <ChevronLeft className="h-4 w-4" />
                                            ) : isNext ? (
                                                <ChevronRight className="h-4 w-4" />
                                            ) : (
                                                <span>{cleanLabel}</span>
                                            );

                                            const baseClass = isArrow
                                                ? 'inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition'
                                                : 'inline-flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2.5 text-xs font-semibold transition';

                                            return link.url ? (
                                                <Link
                                                    key={idx}
                                                    href={link.url}
                                                    title={title}
                                                    aria-label={title}
                                                    className={`${baseClass} ${
                                                        link.active
                                                            ? 'bg-[#9e1a1a] text-white shadow-sm'
                                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                                                    }`}
                                                >
                                                    {content}
                                                </Link>
                                            ) : (
                                                <span
                                                    key={idx}
                                                    title={title}
                                                    aria-label={title}
                                                    className={`${baseClass} text-slate-300 dark:text-slate-600 cursor-not-allowed select-none`}
                                                >
                                                    {content}
                                                </span>
                                            );
                                        })
                                    ) : (
                                        <span className="inline-flex h-8 min-w-[32px] items-center justify-center rounded-lg bg-[#9e1a1a] px-2.5 text-xs font-semibold text-white shadow-sm">
                                            1
                                        </span>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </Deferred>
            </div>

            {deleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                        <div className="flex items-center gap-3.5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
                                <Trash2 className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Hapus Layanan</h3>
                            </div>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            Apakah Anda yakin ingin menghapus layanan &ldquo;{deleteModal.name}&rdquo;?
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
                                {isDeleting && <Loader2 className="h-4 w-4 animate-spin text-white" />}
                                <span>{isDeleting ? 'Menghapus...' : 'Hapus'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
