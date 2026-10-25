import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Loader2, Save } from 'lucide-react';
import { FormEvent } from 'react';

interface JurusanData {
    id: number;
    nama_jurusan: string;
    is_active: boolean;
}

interface Props {
    jurusan: JurusanData | null;
    isSuperAdmin?: boolean;
}

export default function Form({ jurusan, isSuperAdmin = true }: Props) {
    const isEdit = Boolean(jurusan);

    const { data, setData, post, put, processing, errors } = useForm({
        nama_jurusan: jurusan?.nama_jurusan || '',
        is_active: jurusan ? jurusan.is_active : true,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit && jurusan) {
            put(route('admin.jurusan.update', jurusan.id));
        } else {
            post(route('admin.jurusan.store'));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? `Edit ${jurusan?.nama_jurusan}` : 'Tambah Jurusan'} />

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
                                    href={route('admin.jurusan.index')}
                                    className="font-semibold text-[#9e1a1a] hover:underline"
                                >
                                    Jurusan
                                </Link>
                                <span className="text-slate-400 dark:text-slate-600">/</span>
                                <span className="text-slate-600 dark:text-slate-400 font-medium">
                                    {isEdit ? 'Edit' : 'Tambah'}
                                </span>
                            </nav>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
                                {isEdit ? 'Edit Jurusan' : 'Tambah Jurusan'}
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {isEdit
                                    ? 'Perbarui informasi dan status keaktifan data jurusan.'
                                    : 'Tambah unit jurusan baru ke dalam data master akademik.'}
                            </p>
                        </div>

                        <div className="flex items-center shrink-0">
                            <Link
                                href={route('admin.jurusan.index')}
                                className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#9e1a1a] dark:hover:text-rose-400 hover:border-[#9e1a1a]/30 shadow-sm"
                            >
                                Kembali
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl">
                    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Nama Jurusan <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={data.nama_jurusan}
                            onChange={(e) => setData('nama_jurusan', e.target.value)}
                            placeholder="Contoh: Teknik Informatika"
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800 py-2.5 px-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                        />
                        {errors.nama_jurusan && (
                            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.nama_jurusan}</p>
                        )}
                    </div>

                    {isSuperAdmin && (
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 select-none">
                                    Status Jurusan
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
                            href={route('admin.jurusan.index')}
                            className="rounded-lg border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={!data.nama_jurusan.trim() || processing}
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
