import ThemeToggle from '@/Components/ThemeToggle';
import { Link } from '@inertiajs/react';
import { Home } from 'lucide-react';
import { PropsWithChildren } from 'react';

interface GuestLayoutProps extends PropsWithChildren {
    showHomeButton?: boolean;
}

export default function GuestLayout({ children, showHomeButton = true }: GuestLayoutProps) {
    return (
        <div className="flex min-h-screen w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-ung-maroon p-10 text-white lg:flex xl:p-14 2xl:p-16">
                <div className="absolute inset-0 z-0 select-none">
                    <img
                        src="/img/rektorat.jpg"
                        alt=""
                        className="h-full w-full object-cover object-center opacity-45 mix-blend-luminosity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ung-maroon via-ung-maroon/75 to-ung-maroon/60" />
                </div>

                <div
                    className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-28 select-none"
                    aria-hidden="true"
                >
                    <img
                        src="/img/karawo2.svg"
                        alt=""
                        className="h-full w-auto object-cover object-left opacity-60"
                    />
                </div>

                <div className="relative z-20 flex items-center">
                    <img
                        src="/img/logo-web.png"
                        alt="Logo Universitas Negeri Gorontalo"
                        className="h-14 w-auto object-contain drop-shadow"
                    />
                </div>

                <div className="relative z-20 max-w-xl py-10 my-auto">
                    <h2 className="mt-6 text-3xl font-bold leading-snug tracking-tight text-white xl:text-5xl">
                        SINGLE SIGN ON (SSO)
                    </h2>
                    <p className="mt-6 text-sm xl:text-lg leading-relaxed text-white/80">
                        Satu akun untuk seluruh akses layanan akademik dan administrasi di lingkungan Universitas Negeri Gorontalo.
                    </p>
                </div>

                <div className="relative z-20 text-xs text-white/50">
                    &copy; {new Date().getFullYear()} All Right Deserved. Universitas Negeri Gorontalo
                </div>
            </div>

            <div className="relative flex w-full flex-col justify-center overflow-hidden bg-white dark:bg-slate-900 lg:w-[480px] xl:w-[540px] 2xl:w-[580px] lg:shrink-0 border-l border-slate-100 dark:border-slate-800">
                <div className="absolute top-5 right-5 z-20 sm:top-6 sm:right-6 lg:top-8 lg:right-8">
                    <ThemeToggle />
                </div>
                {showHomeButton && (
                    <div className="absolute top-5 left-5 z-20 sm:top-6 sm:left-6 lg:top-8 lg:left-8">
                        <Link
                            href="/"
                            className="group inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-xs transition-colors duration-200 ease-in-out hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#9e1a1a] dark:hover:text-rose-400 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20 dark:focus:ring-rose-500/30"
                        >
                            <Home className="h-4 w-4 text-slate-400 group-hover:text-[#9e1a1a] dark:text-slate-500 dark:group-hover:text-rose-400 transition-colors shrink-0" />
                            <span>Beranda</span>
                        </Link>
                    </div>
                )}
                <div
                    className="pointer-events-none absolute left-0 top-0 z-0 h-72 w-20 select-none overflow-hidden sm:h-72 sm:w-24 lg:hidden"
                    style={{
                        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)',
                    }}
                    aria-hidden="true"
                >
                    <img
                        src="/img/karawo-red.svg"
                        alt=""
                        className="h-full w-full object-cover object-top opacity-55"
                    />
                </div>

                <div
                    className="pointer-events-none absolute right-0 top-0 z-0 h-72 w-20 select-none overflow-hidden sm:h-72 sm:w-24 lg:hidden"
                    style={{
                        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)',
                    }}
                    aria-hidden="true"
                >
                    <img
                        src="/img/karawo-red.svg"
                        alt=""
                        className="h-full w-full -scale-x-100 object-cover object-top opacity-55"
                    />
                </div>

                <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-12 sm:px-10 lg:px-12">
                    <div className="w-full max-w-md">
                        <div className="mb-8 flex justify-center lg:hidden">
                            <img
                                src="/img/ung-logo.png"
                                alt="Logo UNG"
                                className="h-14 w-14 shrink-0 object-contain drop-shadow-sm"
                            />
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
