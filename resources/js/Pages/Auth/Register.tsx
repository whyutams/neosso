import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Loader2, UserPlus } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const isFormValid =
        data.name.trim().length > 0 &&
        data.email.trim().length > 0 &&
        data.password.length >= 8 &&
        data.password_confirmation.length > 0 &&
        data.password === data.password_confirmation;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Daftar" />

            <div className="mb-7">
                <h1 className="text-xl font-bold text-slate-800">Daftar Akun</h1>
                <p className="mt-1 text-xs text-slate-500">
                    Lengkapi formulir di bawah ini untuk membuat akun baru.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4" noValidate>
                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap" required className="text-xs font-medium text-slate-700" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full text-sm"
                        autoComplete="name"
                        isFocused={true}
                        placeholder="Masukkan nama"
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-1 text-xs" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" required className="text-xs font-medium text-slate-700" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full text-sm"
                        autoComplete="username"
                        placeholder="Masukkan email"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-1 text-xs" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" required className="text-xs font-medium text-slate-700" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full text-sm"
                        autoComplete="new-password"
                        placeholder="Masukkan password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-1 text-xs" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password" required className="text-xs font-medium text-slate-700" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full text-sm"
                        autoComplete="new-password"
                        placeholder="Masukkan konfirmasi password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-1 text-xs" />
                </div>

                <button
                    type="submit"
                    disabled={!isFormValid || processing}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-ung-maroon py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-ung-maroon-700 focus:outline-none focus:ring-2 focus:ring-ung-maroon focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {processing ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                            <span>Memproses...</span>
                        </>
                    ) : (
                        <>
                            <UserPlus className="h-4 w-4" />
                            <span>Daftar</span>
                        </>
                    )}
                </button>

                <div className="text-center">
                    <Link
                        href={route('login')}
                        className="text-xs text-slate-400 underline hover:text-ung-maroon"
                    >
                        Sudah memiliki akun? Login
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
