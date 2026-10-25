import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Loader2 } from 'lucide-react';

interface JurusanItem {
    id: number;
    nama_jurusan: string;
}

interface ProdiItem {
    id: number;
    jurusan_id: number;
    nama_prodi: string;
    jenjang: string;
}

interface UserData {
    id: number;
    name: string;
    email: string;
    role: 'superadmin' | 'admin' | 'mahasiswa';
    jurusan_id: number | null;
    program_studi_id: number | null;
    nim: string | null;
    angkatan: number | null;
    is_active: boolean;
}

interface Props {
    user: UserData | null;
    jurusanList: JurusanItem[];
    prodiList: ProdiItem[];
    currentUserId: number;
}

export default function Form({ user, jurusanList, prodiList, currentUserId }: Props) {
    const isEdit = Boolean(user);
    const isSelf = user?.id === currentUserId;

    const { data, setData, post, put, processing, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        role: user?.role || 'admin',
        jurusan_id: user?.jurusan_id ? String(user.jurusan_id) : (jurusanList[0]?.id ? String(jurusanList[0].id) : ''),
        program_studi_id: user?.program_studi_id ? String(user.program_studi_id) : '',
        nim: user?.nim || '',
        angkatan: user?.angkatan ? String(user.angkatan) : '',
        password: '',
        is_active: user ? user.is_active : true,
    });

    const filteredProdi = prodiList.filter(
        (p) => !data.jurusan_id || String(p.jurusan_id) === String(data.jurusan_id)
    );

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit && user) {
            put(route('admin.users.update', user.id));
        } else {
            post(route('admin.users.store'));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? `Edit ${user?.name}` : 'Tambah Pengguna'} />

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
                                    href={route('admin.users.index')}
                                    className="font-semibold text-[#9e1a1a] hover:underline"
                                >
                                    Pengguna
                                </Link>
                                <span className="text-slate-400 dark:text-slate-600">/</span>
                                <span className="text-slate-600 dark:text-slate-400 font-medium">
                                    {isEdit ? 'Edit' : 'Tambah'}
                                </span>
                            </nav>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
                                {isEdit ? 'Edit Pengguna' : 'Tambah Pengguna'}
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {isEdit
                                    ? 'Perbarui informasi data pengguna dan pengaturan hak akses.'
                                    : 'Lengkapi formulir untuk menambahkan akun pengguna baru.'}
                            </p>
                        </div>

                        <div className="flex items-center shrink-0">
                            <Link
                                href={route('admin.users.index')}
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#9e1a1a] dark:hover:text-rose-400 hover:border-[#9e1a1a]/30 shadow-sm"
                            >
                                <span>Kembali</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm space-y-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                required
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Nama lengkap"
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 px-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                            />
                            {errors.name && (
                                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Email UNG
                            </label>
                            <input
                                type="email"
                                required
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="nama@ung.ac.id"
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 px-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                            />
                            {errors.email && (
                                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Peran Akun
                            </label>
                            <select
                                value={data.role}
                                disabled={isSelf}
                                onChange={(e) => setData('role', e.target.value as any)}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 pl-3.5 pr-8 text-sm text-slate-800 dark:text-slate-100 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <option value="admin" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Admin Jurusan</option>
                                <option value="superadmin" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Super Admin</option>
                                <option value="mahasiswa" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Mahasiswa</option>
                            </select>
                            {errors.role && (
                                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.role}</p>
                            )}
                        </div>

                        {data.role !== 'superadmin' && (
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Jurusan
                                </label>
                                <select
                                    required
                                    value={data.jurusan_id}
                                    onChange={(e) => {
                                        setData({
                                            ...data,
                                            jurusan_id: e.target.value,
                                            program_studi_id: '',
                                        });
                                    }}
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 pl-3.5 pr-8 text-sm text-slate-800 dark:text-slate-100 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                                >
                                    <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Pilih Jurusan</option>
                                    {jurusanList.map((jur) => (
                                        <option key={jur.id} value={jur.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{jur.nama_jurusan}</option>
                                    ))}
                                </select>
                                {errors.jurusan_id && (
                                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.jurusan_id}</p>
                                )}
                            </div>
                        )}

                        {data.role === 'mahasiswa' && (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Program Studi
                                    </label>
                                    <select
                                        value={data.program_studi_id}
                                        onChange={(e) => setData('program_studi_id', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 pl-3.5 pr-8 text-sm text-slate-800 dark:text-slate-100 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                                    >
                                        <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Pilih Program Studi</option>
                                        {filteredProdi.map((p) => (
                                            <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                                                {p.jenjang} {p.nama_prodi}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.program_studi_id && (
                                        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.program_studi_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        NIM
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nim}
                                        onChange={(e) => setData('nim', e.target.value)}
                                        placeholder="Contoh: 531422001"
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 px-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                                    />
                                    {errors.nim && (
                                        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.nim}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Angkatan
                                    </label>
                                    <input
                                        type="number"
                                        value={data.angkatan}
                                        onChange={(e) => setData('angkatan', e.target.value)}
                                        placeholder="Contoh: 2022"
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 px-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                                    />
                                    {errors.angkatan && (
                                        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.angkatan}</p>
                                    )}
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Password {isEdit ? '(Kosongkan jika tidak diubah)' : ''}
                            </label>
                            <input
                                type="password"
                                required={!isEdit}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder={isEdit ? '••••••••' : 'Minimal 8 karakter'}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 px-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                            />
                            {errors.password && (
                                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.password}</p>
                            )}
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className={`flex items-center gap-3 select-none ${isSelf ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                            <input
                                type="checkbox"
                                disabled={isSelf}
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#9e1a1a] focus:ring-[#9e1a1a]"
                            />
                            <div>
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status Aktif</span>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {isSelf ? 'Anda tidak dapat menonaktifkan akun sendiri.' : 'Pengguna aktif dapat login ke dalam portal Single Sign-On.'}
                                </p>
                            </div>
                        </label>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                        <Link
                            href={route('admin.users.index')}
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
