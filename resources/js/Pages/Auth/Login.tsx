import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({
    status,
}: {
    status?: string;
    canResetPassword?: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Login" />

            <div className="mb-7">
                <h1 className="text-xl font-bold text-slate-800">Login ke Portal</h1>
                <p className="mt-1 text-xs text-slate-500">
                    Gunakan akun Google Universitas Negeri Gorontalo untuk login.
                </p>
            </div>

            {status && (
                <div className="mb-5 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                    {status}
                </div>
            )}

            <a
                href={route('auth.google.redirect')}
                id="btn-google-login"
                className="flex w-full items-center justify-center gap-2.5 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-ung-maroon hover:text-ung-maroon active:bg-ung-maroon-50/50 focus:outline-none focus:ring-2 focus:ring-ung-maroon focus:ring-offset-2"
            >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Login dengan Akun Google UNG
            </a>

            <div className="relative my-6 flex items-center">
                <div className="flex-1 border-t border-slate-100" />
                <span className="mx-3 shrink-0 text-[10px] text-slate-400">atau administrator</span>
                <div className="flex-1 border-t border-slate-100" />
            </div>

            <form onSubmit={submit} className="space-y-4" noValidate>
                <div>
                    <InputLabel htmlFor="email" value="Email Administrator" className="text-xs font-medium text-slate-700" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full text-sm"
                        autoComplete="username"
                        placeholder="Masukkan email"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-1 text-xs" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" className="text-xs font-medium text-slate-700" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full text-sm"
                        autoComplete="current-password"
                        placeholder="Masukkan password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-1 text-xs" />
                </div>

                <button
                    type="submit"
                    id="btn-admin-login"
                    disabled={processing}
                    className="w-full rounded-md bg-ung-maroon py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-ung-maroon-700 active:bg-ung-maroon-800 focus:outline-none focus:ring-2 focus:ring-ung-maroon focus:ring-offset-2 disabled:opacity-50"
                >
                    {processing ? 'Memverifikasi...' : 'Login sebagai Administrator'}
                </button>
            </form>
        </GuestLayout>
    );
}
