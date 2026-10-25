import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';
import { Loader2, Lock } from 'lucide-react';

export default function UpdatePasswordForm({
    className = '',
}: {
    className?: string;
}) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                    Perbarui Password
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Pastikan akun Anda menggunakan password yang kuat dan aman.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-5 space-y-4 max-w-xl">
                <div>
                    <InputLabel
                        htmlFor="current_password"
                        value="Password Saat Ini"
                        className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                    />

                    <TextInput
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) =>
                            setData('current_password', e.target.value)
                        }
                        type="password"
                        placeholder="Password saat ini"
                        className="mt-1.5 block w-full rounded-lg text-xs"
                        autoComplete="current-password"
                    />

                    <InputError
                        message={errors.current_password}
                        className="mt-1.5 text-xs text-rose-600 dark:text-rose-400"
                    />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password"
                        value="Password Baru"
                        className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                    />

                    <TextInput
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        placeholder="Password baru"
                        className="mt-1.5 block w-full rounded-lg text-xs"
                        autoComplete="new-password"
                    />

                    <InputError message={errors.password} className="mt-1.5 text-xs text-rose-600 dark:text-rose-400" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Konfirmasi Password"
                        className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                    />

                    <TextInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        type="password"
                        placeholder="Ulangi password baru"
                        className="mt-1.5 block w-full rounded-lg text-xs"
                        autoComplete="new-password"
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-1.5 text-xs text-rose-600 dark:text-rose-400"
                    />
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#9e1a1a] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#831414] disabled:opacity-50"
                    >
                        {processing ? (
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                        ) : (
                            <Lock className="h-4 w-4" />
                        )}
                        <span>{processing ? 'Menyimpan...' : 'Simpan Password'}</span>
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            Password berhasil diperbarui.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
