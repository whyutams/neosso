import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import axios from 'axios';
import { Jurusan, PageProps } from '@/types';

interface EditLayananData {
    id: number;
    jurusan_id: number;
    program_studi_id?: number | null;
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

    const initialJurusanId = layanan?.jurusan_id
        ? String(layanan.jurusan_id)
        : (defaultJurusanId ? String(defaultJurusanId) : (jurusanList[0]?.id ? String(jurusanList[0].id) : ''));

    const { data, setData, post, put, processing, errors, reset } = useForm({
        nama_layanan: layanan?.nama_layanan || '',
        slug: layanan?.slug || '',
        url: layanan?.url || '',
        deskripsi: layanan?.deskripsi || '',
        icon_url: layanan?.icon_url || '',
        tipe_integrasi: layanan?.tipe_integrasi || 'sso',
        is_active: layanan ? layanan.is_active : true,
        urutan: layanan?.urutan ?? 1,
        jurusan_id: initialJurusanId,
        client_id: layanan?.sso_client?.client_id || '',
        client_secret: '',
        redirect_uri: layanan?.sso_client?.redirect_uri || '',
    });

    const currentJurusanName = jurusanList.find((j) => String(j.id) === String(data.jurusan_id))?.nama_jurusan || jurusanList[0]?.nama_jurusan || '-';

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
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await axios.post(route('admin.layanan.detect-icon'), {
                url: data.url,
            }, {
                headers: csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {},
            });

            if (res.data?.success && res.data?.icon_url) {
                setData('icon_url', res.data.icon_url);
                setIconMessage({ text: 'Ikon web berhasil dideteksi.', isError: false });
            } else {
                setIconMessage({ text: res.data?.message || 'Ikon tidak ditemukan pada URL ini.', isError: true });
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Gagal mendeteksi ikon web.';
            setIconMessage({ text: msg, isError: true });
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

    const isSsoValid =
        data.tipe_integrasi !== 'sso' ||
        (data.client_id.trim().length > 0 &&
            data.redirect_uri.trim().length > 0 &&
            (isEdit || data.client_secret.trim().length >= 8));

    const isFormValid =
        data.nama_layanan.trim().length > 0 &&
        data.slug.trim().length > 0 &&
        data.url.trim().length > 0 &&
        String(data.jurusan_id).trim().length > 0 &&
        data.urutan !== undefined &&
        !isNaN(Number(data.urutan)) &&
        isSsoValid;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && layanan) {
            put(route('admin.layanan.update', layanan.slug), {
                onError: () => reset('client_secret'),
            });
        } else {
            post(route('admin.layanan.store'), {
                onError: () => reset('client_secret'),
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? `Edit ${layanan?.nama_layanan}` : 'Tambah Layanan'} />

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
                                className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#9e1a1a] dark:hover:text-rose-400 hover:border-[#9e1a1a]/30 shadow-sm"
                            >
                                <span>Kembali</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
                            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
                                Informasi Layanan
                            </h2>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Nama <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama_layanan}
                                        onChange={handleNamaChange}
                                        placeholder="Nama layanan"
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 px-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                                    />
                                    {errors.nama_layanan && (
                                        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.nama_layanan}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Slug <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                                        <span className="flex select-none items-center pl-3.5 text-sm text-slate-400 dark:text-slate-500">
                                            /
                                        </span>
                                        <input
                                            type="text"
                                            value={data.slug}
                                            onChange={(e) => {
                                                setData('slug', e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, ''));
                                            }}
                                            placeholder="slug-layanan"
                                            className="w-full border-0 bg-transparent px-2.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-0"
                                        />
                                    </div>
                                    {errors.slug && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.slug}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        URL <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        value={data.url}
                                        onChange={(e) => setData('url', e.target.value)}
                                        placeholder="https://..."
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 px-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                                    />
                                    {errors.url && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.url}</p>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Jurusan <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={String(data.jurusan_id)}
                                        disabled={!isSuperAdmin}
                                        onChange={(e) => {
                                            setData('jurusan_id', e.target.value);
                                        }}
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 pl-3.5 pr-8 text-sm text-slate-800 dark:text-slate-100 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20 disabled:opacity-60 disabled:cursor-not-allowed select-none"
                                    >
                                        {jurusanList.map((j) => (
                                            <option key={j.id} value={String(j.id)} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                                                {j.nama_jurusan}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.jurusan_id && (
                                        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.jurusan_id}</p>
                                    )}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={data.deskripsi}
                                        onChange={(e) => setData('deskripsi', e.target.value)}
                                        placeholder="Keterangan singkat layanan..."
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 px-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                                    />
                                    {errors.deskripsi && (
                                        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.deskripsi}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {data.tipe_integrasi === 'sso' && (
                            <div className="rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
                                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
                                    Konfigurasi Integrasi SSO
                                </h2>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                Client ID <span className="text-rose-500">*</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={generateClientId}
                                                className="text-xs font-semibold text-[#9e1a1a] dark:text-rose-400 hover:underline"
                                            >
                                                Generate
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={data.client_id}
                                            onChange={(e) => setData('client_id', e.target.value)}
                                            placeholder="client_id"
                                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 px-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                                        />
                                        {errors.client_id && (
                                            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.client_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                Client Secret {!isEdit && <span className="text-rose-500">*</span>}
                                            </label>
                                            <button
                                                type="button"
                                                onClick={generateSecret}
                                                className="text-xs font-semibold text-[#9e1a1a] dark:text-rose-400 hover:underline"
                                            >
                                                Generate
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={data.client_secret}
                                            onChange={(e) => setData('client_secret', e.target.value)}
                                            placeholder={isEdit ? 'Kosongkan jika tidak diubah' : 'Secret'}
                                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 px-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                                        />
                                        {errors.client_secret && (
                                            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.client_secret}</p>
                                        )}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                            Redirect URI <span className="text-rose-500">*</span>
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={data.redirect_uri}
                                            onChange={(e) => setData('redirect_uri', e.target.value)}
                                            placeholder="http://localhost:8001/auth/callback"
                                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 px-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                                        />
                                        {errors.redirect_uri && (
                                            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.redirect_uri}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
                            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
                                Pengaturan Tampilan
                            </h2>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Urutan <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.urutan}
                                    onChange={(e) => setData('urutan', parseInt(e.target.value) || 0)}
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 px-3.5 text-sm text-slate-800 dark:text-slate-100 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                                />
                                {errors.urutan && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.urutan}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Tipe Integrasi <span className="text-rose-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setData('tipe_integrasi', 'sso')}
                                        className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
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
                                        className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
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
                                    <label htmlFor="is_active" className="text-sm font-semibold text-slate-700 dark:text-slate-300 select-none cursor-pointer">
                                        Status Layanan
                                    </label>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className={`h-2 w-2 rounded-full ${data.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
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
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
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
                        </div>

                        <div className="rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
                            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
                                Ikon Layanan
                            </h2>

                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-xs">
                                    {data.icon_url ? (
                                        <img
                                            src={data.icon_url}
                                            alt="Preview"
                                            className="h-9 w-9 object-contain"
                                            onError={() => setData('icon_url', '')}
                                        />
                                    ) : (
                                        <span className="text-sm font-bold text-[#9e1a1a] dark:text-rose-400">
                                            {data.nama_layanan ? data.nama_layanan.slice(0, 2).toUpperCase() : 'SI'}
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 space-y-2">
                                    <button
                                        type="button"
                                        onClick={handleDetectIcon}
                                        disabled={detectingIcon}
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 disabled:opacity-50"
                                    >
                                        {detectingIcon ? 'Mendeteksi...' : 'Deteksi Ikon Web'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-700"
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
                                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline block"
                                >
                                    Hapus Ikon Khusus
                                </button>
                            )}

                            {iconMessage && (
                                <p className={`text-xs ${iconMessage.isError ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                    {iconMessage.text}
                                </p>
                            )}
                        </div>

                        <div className="rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center justify-end gap-3 shadow-sm">
                            <Link
                                href={route('admin.layanan.index')}
                                className="rounded-lg border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
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
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
