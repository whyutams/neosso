import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Lupa Password" />

            <div className="mb-7">
                <h1 className="text-xl font-bold text-slate-800">Lupa Password?</h1>
                <p className="mt-1 text-xs text-slate-500">
                    Masukkan alamat email Anda dan kami akan mengirimkan tautan untuk mengatur ulang password.
                </p>
            </div>

            {status && (
                <div className="mb-5 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4" noValidate>
                <div>
                    <InputLabel htmlFor="email" value="Email" className="text-xs font-medium text-slate-700" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full text-sm"
                        isFocused={true}
                        autoComplete="email"
                        placeholder="Masukkan email"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-1 text-xs" />
                </div>

                <button
                    type="submit"
                    id="btn-send-reset"
                    disabled={processing}
                    className="w-full rounded-md bg-ung-maroon py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-ung-maroon-700 focus:outline-none focus:ring-2 focus:ring-ung-maroon focus:ring-offset-2 disabled:opacity-50"
                >
                    {processing ? 'Mengirim...' : 'Kirim Tautan Reset'}
                </button>
            </form>
        </GuestLayout>
    );
}
