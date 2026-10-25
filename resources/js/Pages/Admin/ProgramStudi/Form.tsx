import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Loader2 } from 'lucide-react';

interface JurusanItem {
    id: number;
    nama_jurusan: string;
}

interface ProgramStudiData {
    id: number;
    nama_prodi: string;
    kode_prodi: string | null;
    jenjang: string;
    jurusan_id: number;
    is_active: boolean;
}

interface Props {
    prodi: ProgramStudiData | null;
    jurusanList: JurusanItem[];
    userJurusanId?: number | null;
    canManageAll: boolean;
}

const JENJANG_OPTIONS = ['D3', 'D4', 'S1', 'S2', 'S3', 'Profesi'];

export default function Form({ prodi, jurusanList, userJurusanId, canManageAll }: Props) {
    const isEdit = Boolean(prodi);

    const { data, setData, post, put, processing, errors } = useForm({
        nama_prodi: prodi?.nama_prodi || '',
        kode_prodi: prodi?.kode_prodi || '',
        jenjang: prodi?.jenjang || 'S1',
        jurusan_id: prodi?.jurusan_id ? String(prodi.jurusan_id) : (userJurusanId ? String(userJurusanId) : (jurusanList[0]?.id ? String(jurusanList[0].id) : '')),
        is_active: prodi ? prodi.is_active : true,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit && prodi) {
            put(route('admin.program-studi.update', prodi.id));
        } else {
            post(route('admin.program-studi.store'));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? `Edit ${prodi?.nama_prodi}` : 'Tambah Program Studi'} />

            <div className="space-y-6 max-w-4xl">
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
                                <Link
                                    href={route('admin.program-studi.index')}
                                    className="font-semibold text-[#9e1a1a] hover:underline"
                                >
                                    Program Studi
                                </Link>
                                <span className="text-slate-400 dark:text-slate-600">/</span>
                                <span className="text-slate-600 dark:text-slate-400 font-medium">
                                    {isEdit ? 'Edit' : 'Tambah'}
                                </span>
                            </nav>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
                                {isEdit ? 'Edit Program Studi' : 'Tambah Program Studi'}
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {isEdit
                                    ? 'Perbarui data kode, nama, dan jenjang program studi.'
                                    : 'Tambah program studi baru pada jurusan yang dipilih.'}
                            </p>
                        </div>

                        <div className="flex items-center shrink-0">
                            <Link
                                href={route('admin.program-studi.index')}
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#9e1a1a] dark:hover:text-rose-400 hover:border-[#9e1a1a]/30 shadow-sm"
                            >
                                <span>Kembali</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm space-y-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Nama Program Studi
                            </label>
                            <input
                                type="text"
                                required
                                value={data.nama_prodi}
                                onChange={(e) => setData('nama_prodi', e.target.value)}
                                placeholder="Contoh: S1 Teknik Informatika"
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 px-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                            />
                            {errors.nama_prodi && (
                                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.nama_prodi}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Kode Program Studi
                            </label>
                            <input
                                type="text"
                                value={data.kode_prodi}
                                onChange={(e) => setData('kode_prodi', e.target.value)}
                                placeholder="Contoh: 5314"
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 px-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                            />
                            {errors.kode_prodi && (
                                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.kode_prodi}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Jenjang
                            </label>
                            <select
                                value={data.jenjang}
                                onChange={(e) => setData('jenjang', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 pl-3.5 pr-8 text-sm text-slate-800 dark:text-slate-100 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                            >
                                {JENJANG_OPTIONS.map((j) => (
                                    <option key={j} value={j} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{j}</option>
                                ))}
                            </select>
                            {errors.jenjang && (
                                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.jenjang}</p>
                            )}
                        </div>

                        {canManageAll && (
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Jurusan
                                </label>
                                <select
                                    value={data.jurusan_id}
                                    onChange={(e) => setData('jurusan_id', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 pl-3.5 pr-8 text-sm text-slate-800 dark:text-slate-100 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                                >
                                    {jurusanList.map((jur) => (
                                        <option key={jur.id} value={jur.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{jur.nama_jurusan}</option>
                                    ))}
                                </select>
                                {errors.jurusan_id && (
                                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.jurusan_id}</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#9e1a1a] focus:ring-[#9e1a1a]"
                            />
                            <div>
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status Aktif</span>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Program studi aktif dapat terhubung dengan data mahasiswa dan akun SSO.</p>
                            </div>
                        </label>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                        <Link
                            href={route('admin.program-studi.index')}
                            className="rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#9e1a1a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#831414] disabled:opacity-50 shadow-sm"
                        >
                            {processing && <Loader2 className="h-4 w-4 animate-spin text-white" />}
                            <span>{processing ? 'Menyimpan...' : 'Simpan'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
