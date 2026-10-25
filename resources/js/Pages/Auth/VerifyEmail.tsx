import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Verifikasi Email" />

            <div className="mb-7">
                <h1 className="text-xl font-bold text-slate-800">Verifikasi Email Anda</h1>
                <p className="mt-1 text-xs text-slate-500">
                    Tautan verifikasi telah dikirimkan ke alamat email Anda. Silakan periksa kotak masuk dan klik tautan tersebut untuk melanjutkan.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                    Tautan verifikasi baru telah dikirimkan ke alamat email Anda.
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <button
                    type="submit"
                    id="btn-resend-verification"
                    disabled={processing}
                    className="w-full rounded-lg bg-ung-maroon py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-ung-maroon-700 focus:outline-none focus:ring-2 focus:ring-ung-maroon focus:ring-offset-2 disabled:opacity-50"
                >
                    {processing ? 'Mengirim ulang...' : 'Kirim Ulang Tautan Verifikasi'}
                </button>

                <div className="text-center">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-xs text-slate-400 underline hover:text-ung-maroon"
                    >
                        Logout
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
