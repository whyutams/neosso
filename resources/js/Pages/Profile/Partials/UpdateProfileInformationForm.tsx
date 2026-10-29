import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Loader2, Check } from 'lucide-react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                    Informasi Profil
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Perbarui nama dan alamat email akun Anda.
                </p>
            </header>

            <form onSubmit={submit} className="mt-5 space-y-5 w-full">
                <div>
                    <InputLabel htmlFor="name" value="Nama" required className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" />
                    <TextInput
                        id="name"
                        className="block w-full rounded-lg text-sm py-2.5 px-3.5"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Nama Anda"
                        required
                        autoComplete="name"
                    />
                    <InputError className="mt-1 text-xs text-rose-600 dark:text-rose-400" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" required className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" />
                    <TextInput
                        id="email"
                        type="email"
                        className="block w-full rounded-lg text-sm py-2.5 px-3.5"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="Alamat email Anda"
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-1 text-xs text-rose-600 dark:text-rose-400" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 p-3.5 text-sm text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                        <p>
                            Alamat email Anda belum diverifikasi.{' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="font-semibold underline hover:text-[#9e1a1a]"
                            >
                                Klik di sini untuk mengirim ulang email verifikasi.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <p className="mt-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                                Tautan verifikasi baru telah dikirim ke alamat email Anda.
                            </p>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={!data.name.trim() || !data.email.trim() || processing}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#9e1a1a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#831414] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {processing ? (
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                        ) : (
                            <Check className="h-4 w-4" />
                        )}
                        <span>{processing ? 'Menyimpan...' : 'Simpan'}</span>
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            Tersimpan.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
