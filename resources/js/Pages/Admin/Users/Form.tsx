import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { Check, Eye, EyeOff, Loader2, Save, X } from 'lucide-react';
import Tooltip from '@/Components/Tooltip';

interface JurusanItem {
    id: number;
    nama_jurusan: string;
}

interface Props {
    jurusanList: JurusanItem[];
}

export default function Form({ jurusanList }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'admin' as const,
        jurusan_id: '',
        is_active: true,
    });

    const hasMinLength = data.password.length >= 8;
    const hasLetters = /[a-zA-Z]/.test(data.password);
    const hasNumbers = /[0-9]/.test(data.password);
    const isPasswordValid = hasMinLength && hasLetters && hasNumbers;
    const isPasswordConfirmed =
        data.password_confirmation.length > 0 &&
        data.password === data.password_confirmation;

    const isFormValid =
        data.name.trim().length > 0 &&
        data.email.trim().length > 0 &&
        isPasswordValid &&
        isPasswordConfirmed &&
        String(data.jurusan_id).trim().length > 0;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            onError: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Tambah Pengguna" />

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
                                    href={route('admin.users.index')}
                                    className="font-semibold text-[#9e1a1a] hover:underline"
                                >
                                    Pengguna
                                </Link>
                                <span className="text-slate-400 dark:text-slate-600">/</span>
                                <span className="text-slate-600 dark:text-slate-400 font-medium">
                                    Tambah
                                </span>
                            </nav>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
                                Tambah Pengguna
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Lengkapi formulir untuk menambahkan akun admin jurusan baru.
                            </p>
                        </div>

                        <div className="flex items-center shrink-0">
                            <Link
                                href={route('admin.users.index')}
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
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Nama Lengkap <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Nama lengkap"
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 px-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Email UNG <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="nama@ung.ac.id"
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 px-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Password <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        minLength={8}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Minimal 8 karakter (huruf & angka)"
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 pl-3.5 pr-10 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                                    />
                                    <Tooltip content={showPassword ? 'Sembunyikan password' : 'Lihat password'} position="top">
                                        <button
                                            type="button"
                                            tabIndex={-1}
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                                            aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </Tooltip>
                                </div>
                                {data.password.length > 0 && (
                                    <div className="mt-2 space-y-1 text-xs">
                                        <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
                                            {hasMinLength ? (
                                                <Check className="h-3.5 w-3.5 shrink-0" />
                                            ) : (
                                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600 ml-1 mr-1" />
                                            )}
                                            <span>Minimal 8 karakter</span>
                                        </div>
                                        <div className={`flex items-center gap-1.5 ${hasLetters ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
                                            {hasLetters ? (
                                                <Check className="h-3.5 w-3.5 shrink-0" />
                                            ) : (
                                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600 ml-1 mr-1" />
                                            )}
                                            <span>Mengandung huruf</span>
                                        </div>
                                        <div className={`flex items-center gap-1.5 ${hasNumbers ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
                                            {hasNumbers ? (
                                                <Check className="h-3.5 w-3.5 shrink-0" />
                                            ) : (
                                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600 ml-1 mr-1" />
                                            )}
                                            <span>Mengandung angka</span>
                                        </div>
                                    </div>
                                )}
                                {errors.password && (
                                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.password}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Konfirmasi Password <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Ulangi password"
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 pl-3.5 pr-10 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                                    />
                                    <Tooltip content={showConfirmPassword ? 'Sembunyikan password' : 'Lihat password'} position="top">
                                        <button
                                            type="button"
                                            tabIndex={-1}
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                                            aria-label={showConfirmPassword ? 'Sembunyikan password' : 'Lihat password'}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </Tooltip>
                                </div>
                                {data.password_confirmation.length > 0 && (
                                    <div className="mt-2 text-xs">
                                        {isPasswordConfirmed ? (
                                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                                                <Check className="h-3.5 w-3.5 shrink-0" />
                                                <span>Password cocok</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                                                <X className="h-3.5 w-3.5 shrink-0" />
                                                <span>Konfirmasi belum cocok</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {errors.password_confirmation && (
                                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.password_confirmation}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Peran Akun <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value="admin"
                                    disabled
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/50 py-2.5 pl-3.5 pr-8 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed select-none"
                                >
                                    <option value="admin" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                                        Admin Jurusan
                                    </option>
                                </select>
                                {errors.role && (
                                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.role}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Jurusan <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    required
                                    value={data.jurusan_id}
                                    onChange={(e) => setData('jurusan_id', e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 pl-3.5 pr-8 text-sm text-slate-800 dark:text-slate-100 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20 select-none"
                                >
                                    <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                                        Pilih Jurusan
                                    </option>
                                    {jurusanList.map((jur) => (
                                        <option key={jur.id} value={jur.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                                            {jur.nama_jurusan}
                                        </option>
                                    ))}
                                </select>
                                {errors.jurusan_id && (
                                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.jurusan_id}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 select-none">
                                    Status Akun
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

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                            <Link
                                href={route('admin.users.index')}
                                className="rounded-lg border border-slate-200 dark:border-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={!isFormValid || processing}
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
