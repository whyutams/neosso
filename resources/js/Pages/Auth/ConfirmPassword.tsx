import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Check, Loader2 } from 'lucide-react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Konfirmasi Password" />

            <div className="mb-7">
                <h1 className="text-xl font-bold text-slate-800">Konfirmasi Password</h1>
                <p className="mt-1 text-xs text-slate-500">
                    Area ini memerlukan konfirmasi password sebelum melanjutkan.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4" noValidate>
                <div>
                    <InputLabel htmlFor="password" value="Password" required className="text-xs font-medium text-slate-700" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full text-sm"
                        isFocused={true}
                        autoComplete="current-password"
                        placeholder="Masukkan password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-1 text-xs" />
                </div>

                <button
                    type="submit"
                    id="btn-confirm-password"
                    disabled={!data.password || processing}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-ung-maroon py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-ung-maroon-700 focus:outline-none focus:ring-2 focus:ring-ung-maroon focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {processing ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                            <span>Memverifikasi...</span>
                        </>
                    ) : (
                        <>
                            <Check className="h-4 w-4" />
                            <span>Konfirmasi</span>
                        </>
                    )}
                </button>
            </form>
        </GuestLayout>
    );
}
