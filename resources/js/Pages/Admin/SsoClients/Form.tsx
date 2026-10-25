import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface LayananItem {
    id: number;
    nama_layanan: string;
    url: string;
}

interface SsoClientData {
    id: number;
    layanan_id: number;
    client_id: string;
    client_secret: string;
    redirect_uri: string;
    is_active: boolean;
    layanan?: LayananItem;
}

interface Props {
    client: SsoClientData | null;
    availableLayanan: LayananItem[];
}

export default function Form({ client, availableLayanan }: Props) {
    const isEdit = Boolean(client);
    const [copied, setCopied] = useState<string | null>(null);

    const { data, setData, post, put, processing, errors } = useForm({
        layanan_id: client ? String(client.layanan_id) : (availableLayanan[0]?.id ? String(availableLayanan[0].id) : ''),
        redirect_uri: client?.redirect_uri || '',
        is_active: client ? client.is_active : true,
    });

    const handleCopy = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit && client) {
            put(route('admin.sso-clients.update', client.id));
        } else {
            post(route('admin.sso-clients.store'));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? `Edit Klien SSO - ${client?.client_id}` : 'Tambah Klien SSO'} />

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
                                    href={route('admin.sso-clients.index')}
                                    className="font-semibold text-[#9e1a1a] hover:underline"
                                >
                                    Klien SSO
                                </Link>
                                <span className="text-slate-400 dark:text-slate-600">/</span>
                                <span className="text-slate-600 dark:text-slate-400 font-medium">
                                    {isEdit ? 'Edit' : 'Tambah'}
                                </span>
                            </nav>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
                                {isEdit ? 'Edit Klien SSO' : 'Tambah Klien SSO'}
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {isEdit
                                    ? 'Perbarui konfigurasi redirect URI dan status klien SSO.'
                                    : 'Buat kredensial OAuth 2.0 baru untuk integrasi layanan.'}
                            </p>
                        </div>

                        <div className="flex items-center shrink-0">
                            <Link
                                href={route('admin.sso-clients.index')}
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#9e1a1a] dark:hover:text-rose-400 hover:border-[#9e1a1a]/30 shadow-sm"
                            >
                                <span>Kembali</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Layanan Terhubung
                        </label>
                        {isEdit ? (
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-3">
                                <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                                    {client?.layanan?.nama_layanan || 'Layanan Terdaftar'}
                                </span>
                                {client?.layanan?.url && (
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{client.layanan.url}</div>
                                )}
                            </div>
                        ) : (
                            <select
                                required
                                value={data.layanan_id}
                                onChange={(e) => setData('layanan_id', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 pl-3.5 pr-8 text-sm text-slate-800 dark:text-slate-100 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                            >
                                {availableLayanan.map((l) => (
                                    <option key={l.id} value={l.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                                        {l.nama_layanan} ({l.url})
                                    </option>
                                ))}
                            </select>
                        )}
                        {errors.layanan_id && (
                            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.layanan_id}</p>
                        )}
                    </div>

                    {isEdit && client && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                    Client ID
                                </label>
                                <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs">
                                    <span className="truncate text-slate-800 dark:text-slate-200">{client.client_id}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(client.client_id, 'client_id')}
                                        className="text-[#9e1a1a] dark:text-rose-400 hover:underline font-semibold shrink-0 text-xs"
                                    >
                                        {copied === 'client_id' ? 'Tersalin' : 'Salin'}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                    Client Secret
                                </label>
                                <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs">
                                    <span className="truncate text-slate-400 dark:text-slate-500">••••••••••••••••••••••••</span>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(client.client_secret, 'client_secret')}
                                        className="text-[#9e1a1a] dark:text-rose-400 hover:underline font-semibold shrink-0 text-xs"
                                    >
                                        {copied === 'client_secret' ? 'Tersalin' : 'Salin'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Redirect URI
                        </label>
                        <textarea
                            required
                            rows={4}
                            value={data.redirect_uri}
                            onChange={(e) => setData('redirect_uri', e.target.value)}
                            placeholder="https://aplikasi.ung.ac.id/auth/callback&#10;Satu URL callback per baris"
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 py-2.5 px-3.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                        />
                        {errors.redirect_uri && (
                            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.redirect_uri}</p>
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
                                <p className="text-xs text-slate-500 dark:text-slate-400">Klien SSO aktif dapat melakukan pertukaran token autentikasi mahasiswa dan admin.</p>
                            </div>
                        </label>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                        <Link
                            href={route('admin.sso-clients.index')}
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
