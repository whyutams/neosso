import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';

export default function DeleteUserForm({
    className = '',
}: {
    className?: string;
}) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-4 ${className}`}>
            <header className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                    Hapus Akun
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Setelah akun Anda dihapus, seluruh data dan akses terkait akan dihapus secara permanen.
                </p>
            </header>

            <button
                type="button"
                onClick={confirmUserDeletion}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
            >
                <Trash2 className="h-4 w-4" />
                <span>Hapus Akun</span>
            </button>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6 sm:p-7">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Konfirmasi Hapus Akun
                    </h2>

                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        Apakah Anda yakin ingin menghapus akun Anda? Masukkan password untuk mengonfirmasi bahwa Anda benar-benar ingin menghapus akun secara permanen.
                    </p>

                    <div className="mt-4">
                        <InputLabel
                            htmlFor="password"
                            value="Password"
                            className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="mt-1.5 block w-full rounded-xl text-sm px-3.5 py-2.5"
                            isFocused
                            placeholder="Password Anda"
                        />

                        <InputError
                            message={errors.password}
                            className="mt-1.5 text-xs text-rose-600 dark:text-rose-400"
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50 shadow-sm"
                        >
                            {processing ? (
                                <Loader2 className="h-4 w-4 animate-spin text-white" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                            <span>{processing ? 'Menghapus...' : 'Hapus Akun'}</span>
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
