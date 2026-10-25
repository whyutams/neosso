import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const user = usePage().props.auth.user;
    const isSuperAdmin = user.role === 'superadmin';

    return (
        <AuthenticatedLayout>
            <Head title="Profil" />

            <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                    <div className="space-y-1">
                        <nav className="flex items-center gap-1.5 text-xs">
                            <Link
                                href={route('dashboard')}
                                className="font-semibold text-[#9e1a1a] hover:underline"
                            >
                                Dashboard
                            </Link>
                            <span className="text-slate-400 dark:text-slate-600">/</span>
                            <span className="text-slate-600 dark:text-slate-400 font-medium">Profil</span>
                        </nav>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                            Profil
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Kelola data akun pribadi, kata sandi, dan keamanan Anda.
                        </p>
                    </div>
                </div>

                <div className="space-y-6 max-w-4xl">
                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                        <UpdatePasswordForm />
                    </div>

                    {!isSuperAdmin && (
                        <div className="rounded-2xl border border-rose-200/80 dark:border-rose-950/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
                            <DeleteUserForm />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
