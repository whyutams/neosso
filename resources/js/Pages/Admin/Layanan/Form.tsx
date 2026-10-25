import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Jurusan, PageProps } from '@/types';

interface EditLayananData {
    id: number;
    jurusan_id: number;
    nama_layanan: string;
    slug: string;
    url: string;
    deskripsi?: string | null;
    icon_url?: string | null;
    tipe_integrasi: 'sso' | 'link_eksternal';
    is_active: boolean;
    urutan: number;
    sso_client?: {
        id: number;
        client_id: string;
        redirect_uri: string;
        is_active: boolean;
    } | null;
}

interface Props extends PageProps {
    layanan: EditLayananData | null;
    jurusanList: Jurusan[];
    isSuperAdmin: boolean;
    defaultJurusanId?: number | null;
}

export default function Form({
    layanan,
    jurusanList,
    isSuperAdmin,
    defaultJurusanId,
}: Props) {
    const isEdit = Boolean(layanan);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, put, processing, errors } = useForm({
        nama_layanan: layanan?.nama_layanan || '',
        slug: layanan?.slug || '',
        url: layanan?.url || '',
        deskripsi: layanan?.deskripsi || '',
        icon_url: layanan?.icon_url || '',
        tipe_integrasi: layanan?.tipe_integrasi || 'sso',
        is_active: layanan ? layanan.is_active : true,
        urutan: layanan?.urutan ?? 1,
        jurusan_id: layanan?.jurusan_id || defaultJurusanId || (jurusanList[0]?.id ?? ''),
        client_id: layanan?.sso_client?.client_id || '',
        client_secret: '',
        redirect_uri: layanan?.sso_client?.redirect_uri || '',
    });

    const [namaTouched, setNamaTouched] = useState(false);
    const [detectingIcon, setDetectingIcon] = useState(false);
    const [iconMessage, setIconMessage] = useState<{ text: string; isError: boolean } | null>(null);

    const toSlug = (text: string) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/[\s_]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    // Sinkronisasi otomatis slug dengan debounce beberapa milidetik setelah user mengetik nama layanan
    useEffect(() => {
        if (!namaTouched) return;

        const timer = setTimeout(() => {
            setData('slug', toSlug(data.nama_layanan));
        }, 300);

        return () => clearTimeout(timer);
    }, [data.nama_layanan, namaTouched]);

    const handleNamaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('nama_layanan', e.target.value);
        setNamaTouched(true);
    };

    const generateSecret = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
        let secret = '';
        for (let i = 0; i < 32; i++) {
            secret += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setData('client_secret', secret);
    };

    const generateClientId = () => {
        const prefix = data.slug || 'layanan';
        const randomStr = Math.random().toString(36).substring(2, 8);
        setData('client_id', `client_${prefix.replace(/-/g, '_')}_${randomStr}`);
    };

    const handleDetectIcon = async () => {
        if (!data.url) {
            setIconMessage({ text: 'Masukkan URL layanan terlebih dahulu.', isError: true });
            return;
        }

        setDetectingIcon(true);
        setIconMessage(null);

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const res = await fetch(route('admin.layanan.detect-icon'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ url: data.url }),
            });

            const json = await res.json();
            if (res.ok && json.success && json.icon_url) {
                setData('icon_url', json.icon_url);
                setIconMessage({ text: 'Ikon web berhasil dideteksi.', isError: false });
            } else {
                setIconMessage({ text: json.message || 'Ikon tidak ditemukan pada URL ini.', isError: true });
            }
        } catch {
            setIconMessage({ text: 'Gagal mendeteksi ikon web.', isError: true });
        } finally {
            setDetectingIcon(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            if (base64) {
                setData('icon_url', base64);
                setIconMessage({ text: 'Ikon berhasil diunggah.', isError: false });
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && layanan) {
            put(route('admin.layanan.update', layanan.slug));
        } else {
            post(route('admin.layanan.store'));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? `Edit ${layanan?.nama_layanan}` : 'Tambah Layanan'} />

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
                                <Link
                                    href={route('admin.layanan.index')}
                                    className="font-semibold text-[#9e1a1a] hover:underline"
                                >
                                    Layanan
                                </Link>
                                <span className="text-slate-400 dark:text-slate-600">/</span>
                                <span className="text-slate-600 dark:text-slate-400 font-medium">
                                    {isEdit ? 'Edit' : 'Tambah'}
                                </span>
                            </nav>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
                                {isEdit ? 'Edit Layanan' : 'Tambah Layanan'}
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {isEdit
                                    ? 'Perbarui konfigurasi, tautan, dan visibilitas layanan SSO.'
                                    : 'Daftarkan layanan digital baru ke dalam portal SSO UNG.'}
                            </p>
                        </div>

                        <div className="flex items-center shrink-0">
                            <Link
                                href={route('admin.layanan.index')}
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#9e1a1a] dark:hover:text-rose-400 hover:border-[#9e1a1a]/30 shadow-sm"
                            >
                                <span>Kembali</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-sm">
                            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
                                Informasi Layanan
                            </h2>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Nama <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama_layanan}
                                        onChange={handleNamaChange}
                                        placeholder="Nama layanan"
                                        className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9e1a1a]"
                                    />
                                    {errors.nama_layanan && (
                                        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.nama_layanan}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Slug <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="mt-1.5 flex rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                                        <span className="flex select-none items-center pl-3 text-xs text-slate-400 dark:text-slate-500">
                                            /
                                        </span>
                                        <input
                                            type="text"
                                            value={data.slug}
                                            onChange={(e) => {
                                                setData('slug', e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, ''));
                                            }}
                                            placeholder="slug-layanan"
                                            className="w-full border-0 bg-transparent px-2 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-0"
                                        />
                                    </div>
                                    {errors.slug && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.slug}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Urutan
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={data.urutan}
                                        onChange={(e) => setData('urutan', parseInt(e.target.value) || 0)}
                                        className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9e1a1a]"
                                    />
                                    {errors.urutan && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.urutan}</p>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        URL <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        value={data.url}
                                        onChange={(e) => setData('url', e.target.value)}
                                        placeholder="https://..."
                                        className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9e1a1a]"
                                    />
                                    {errors.url && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.url}</p>}
                                </div>

                                {isSuperAdmin && (
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Jurusan <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={data.jurusan_id}
                                            onChange={(e) => setData('jurusan_id', parseInt(e.target.value))}
                                            className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2 pl-3 pr-8 text-xs text-slate-800 dark:text-slate-100 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9e1a1a]"
                                        >
                                            {jurusanList.map((j) => (
                                                <option key={j.id} value={j.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                                                    {j.nama_jurusan}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.jurusan_id && (
                                            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.jurusan_id}</p>
                                        )}
                                    </div>
                                )}

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={data.deskripsi}
                                        onChange={(e) => setData('deskripsi', e.target.value)}
                                        placeholder="Keterangan singkat layanan..."
                                        className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9e1a1a]"
                                    />
                                    {errors.deskripsi && (
                                        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.deskripsi}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {data.tipe_integrasi === 'sso' && (
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-sm">
                                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
                                    Kredensial SSO
                                </h2>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                Client ID <span className="text-rose-500">*</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={generateClientId}
                                                className="text-[11px] font-semibold text-[#9e1a1a] dark:text-rose-400 hover:underline"
                                            >
                                                Generate
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={data.client_id}
                                            onChange={(e) => setData('client_id', e.target.value)}
                                            placeholder="client_id"
                                            className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9e1a1a]"
                                        />
                                        {errors.client_id && (
                                            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.client_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between">
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                Client Secret {!isEdit && <span className="text-rose-500">*</span>}
                                            </label>
                                            <button
                                                type="button"
                                                onClick={generateSecret}
                                                className="text-[11px] font-semibold text-[#9e1a1a] dark:text-rose-400 hover:underline"
                                            >
                                                Generate
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={data.client_secret}
                                            onChange={(e) => setData('client_secret', e.target.value)}
                                            placeholder={isEdit ? 'Kosongkan jika tidak diubah' : 'Secret'}
                                            className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9e1a1a]"
                                        />
                                        {errors.client_secret && (
                                            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.client_secret}</p>
                                        )}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Redirect URI <span className="text-rose-500">*</span>
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={data.redirect_uri}
                                            onChange={(e) => setData('redirect_uri', e.target.value)}
                                            placeholder="http://localhost:8001/auth/callback"
                                            className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#9e1a1a]"
                                        />
                                        {errors.redirect_uri && (
                                            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.redirect_uri}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6 lg:col-span-1">
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-sm">
                            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
                                Tipe & Visibilitas
                            </h2>

                            <div className="space-y-2">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Tipe Integrasi <span className="text-rose-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setData('tipe_integrasi', 'sso')}
                                        className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                                            data.tipe_integrasi === 'sso'
                                                ? 'border-[#9e1a1a] dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/40 text-[#9e1a1a] dark:text-rose-400'
                                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        SSO
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('tipe_integrasi', 'link_eksternal')}
                                        className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                                            data.tipe_integrasi === 'link_eksternal'
                                                ? 'border-[#9e1a1a] dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/40 text-[#9e1a1a] dark:text-rose-400'
                                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        Eksternal
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                                <div>
                                    <label htmlFor="is_active" className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none cursor-pointer">
                                        Status Layanan
                                    </label>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className={`h-1.5 w-1.5 rounded-full ${data.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                            {data.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    id="is_active"
                                    role="switch"
                                    aria-checked={data.is_active}
                                    onClick={() => setData('is_active', !data.is_active)}
                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        data.is_active ? 'bg-[#9e1a1a]' : 'bg-slate-200 dark:bg-slate-700'
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            data.is_active ? 'translate-x-4' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-sm">
                            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
                                Ikon Layanan
                            </h2>

                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 overflow-hidden">
                                    {data.icon_url ? (
                                        <img
                                            src={data.icon_url}
                                            alt="Preview"
                                            className="h-8 w-8 object-contain"
                                            onError={() => setData('icon_url', '')}
                                        />
                                    ) : (
                                        <span className="text-xs font-bold text-[#9e1a1a] dark:text-rose-400">
                                            {data.nama_layanan ? data.nama_layanan.slice(0, 2).toUpperCase() : 'SI'}
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 space-y-1.5">
                                    <button
                                        type="button"
                                        onClick={handleDetectIcon}
                                        disabled={detectingIcon}
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 disabled:opacity-50"
                                    >
                                        {detectingIcon ? 'Mendeteksi...' : 'Deteksi Ikon Web'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-700"
                                    >
                                        Unggah Ikon Manual
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            {data.icon_url && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setData('icon_url', '');
                                        setIconMessage(null);
                                    }}
                                    className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline block"
                                >
                                    Hapus Ikon Khusus
                                </button>
                            )}

                            {iconMessage && (
                                <p className={`text-[11px] ${iconMessage.isError ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                    {iconMessage.text}
                                </p>
                            )}
                        </div>

                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center justify-end gap-2.5 shadow-sm">
                            <Link
                                href={route('admin.layanan.index')}
                                className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-[#9e1a1a] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#831414] disabled:opacity-50 shadow-sm"
                            >
                                {processing && <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />}
                                <span>{processing ? 'Menyimpan...' : 'Simpan'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
