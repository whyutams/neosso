import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Loader2, Save } from 'lucide-react';

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
    canManageStatus?: boolean;
}

const JENJANG_OPTIONS = ['D3', 'D4', 'S1', 'S2', 'S3', 'Profesi'];

export default function Form({ prodi, jurusanList, userJurusanId, canManageAll, canManageStatus = true }: Props) {
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

            <div className="space-y-6 w-full">
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
                                className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#9e1a1a] dark:hover:text-rose-400 hover:border-[#9e1a1a]/30 shadow-sm"
                            >
                                Kembali
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl">
                    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm space-y-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Nama Program Studi <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={data.nama_prodi}
                                onChange={(e) => setData('nama_prodi', e.target.value)}
                                placeholder="Contoh: S1 Teknik Informatika"
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 px-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
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
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 px-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                            />
                            {errors.kode_prodi && (
                                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.kode_prodi}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Jenjang <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.jenjang}
                                onChange={(e) => setData('jenjang', e.target.value)}
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 pl-3.5 pr-8 text-sm text-slate-800 dark:text-slate-100 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                            >
                                {JENJANG_OPTIONS.map((j) => (
                                    <option key={j} value={j} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{j}</option>
                                ))}
                            </select>
                            {errors.jenjang && (
                                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.jenjang}</p>
                            )}
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Jurusan <span className="text-rose-500">*</span>
                            </label>
                            {canManageAll ? (
                                <select
                                    value={data.jurusan_id}
                                    onChange={(e) => setData('jurusan_id', e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 pl-3.5 pr-8 text-sm text-slate-800 dark:text-slate-100 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                                >
                                    {jurusanList.map((jur) => (
                                        <option key={jur.id} value={jur.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{jur.nama_jurusan}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    disabled
                                    readOnly
                                    value={jurusanList.find((jur) => String(jur.id) === String(data.jurusan_id))?.nama_jurusan || jurusanList[0]?.nama_jurusan || '-'}
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/50 py-2.5 px-3.5 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed select-none"
                                />
                            )}
                            {errors.jurusan_id && (
                                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.jurusan_id}</p>
                            )}
                        </div>
                    </div>

                    {canManageStatus && (
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 select-none">
                                    Status Program Studi
                                </label>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className={`h-2 w-2 rounded-full ${data.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                        {data.is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={data.is_active}
                                onClick={() => setData('is_active', !data.is_active)}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#9e1a1a] focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                                    data.is_active ? 'bg-[#9e1a1a]' : 'bg-slate-300 dark:bg-slate-700'
                                }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                        data.is_active ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                        <Link
                            href={route('admin.program-studi.index')}
                            className="rounded-lg border border-slate-200 dark:border-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={!data.nama_prodi.trim() || !data.jenjang.trim() || !String(data.jurusan_id).trim() || processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#9e1a1a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#831414] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {processing ? (
                                <Loader2 className="h-4 w-4 animate-spin text-white" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            <span>{processing ? 'Menyimpan...' : 'Simpan'}</span>
                        </button>
                    </div>
                </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
