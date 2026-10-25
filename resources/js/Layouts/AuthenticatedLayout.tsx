import Dropdown from '@/Components/Dropdown';
import ThemeToggle from '@/Components/ThemeToggle';
import { Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Building2,
    Check,
    ChevronDown,
    ExternalLink,
    GraduationCap,
    Home,
    KeyRound,
    LayoutDashboard,
    Layers,
    Loader2,
    LogOut,
    Menu,
    PanelLeftClose,
    PanelLeftOpen,
    Pencil,
    Search,
    ShieldAlert,
    User,
    Users,
    X,
} from 'lucide-react';
import { FormEvent, KeyboardEvent as ReactKeyboardEvent, PropsWithChildren, ReactNode, useEffect, useRef, useState } from 'react';

interface SearchResult {
    id: number;
    nama_layanan: string;
    slug: string;
    url: string;
    tipe_integrasi: 'sso' | 'link_eksternal';
    deskripsi?: string | null;
    icon_url?: string | null;
    is_active: boolean;
    jurusan_id?: number | null;
}

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sidebar_collapsed') === 'true';
        }
        return false;
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const searchContainerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Debounce pencarian global layanan
    useEffect(() => {
        const query = searchQuery.trim();
        if (!query) {
            setSearchResults([]);
            setIsSearching(false);
            setSearchOpen(false);
            setSelectedIndex(-1);
            return;
        }

        setIsSearching(true);
        setSearchOpen(true);
        setSelectedIndex(-1);

        const timer = setTimeout(() => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            const controller = new AbortController();
            abortControllerRef.current = controller;

            fetch(route('layanan.search-preview', { q: query }), {
                signal: controller.signal,
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
                .then((res) => {
                    if (!res.ok) throw new Error('Search failed');
                    return res.json();
                })
                .then((data: SearchResult[]) => {
                    setSearchResults(Array.isArray(data) ? data : []);
                    setIsSearching(false);
                })
                .catch((err) => {
                    if (err.name !== 'AbortError') {
                        setIsSearching(false);
                    }
                });
        }, 250);

        return () => {
            clearTimeout(timer);
        };
    }, [searchQuery]);

    // Tutup preview saat klik di luar atau tekan Escape
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
                setSearchOpen(false);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSearchOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleSearchSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
            window.open(searchResults[selectedIndex].url, '_blank');
            setSearchOpen(false);
            return;
        }
        if (searchQuery.trim()) {
            setSearchOpen(false);
            if (user.role === 'admin' || user.role === 'superadmin') {
                router.get(route('admin.layanan.index'), { q: searchQuery.trim() });
            } else {
                router.get(route('dashboard'), { q: searchQuery.trim() });
            }
        }
    };

    const handleSearchKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
        if (!searchOpen || searchResults.length === 0) {
            if (e.key === 'ArrowDown' && searchResults.length > 0) {
                setSearchOpen(true);
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
        } else if (e.key === 'Escape') {
            setSearchOpen(false);
        }
    };


    const toggleSidebarCollapsed = () => {
        setSidebarCollapsed((prev) => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('sidebar_collapsed', String(next));
            }
            return next;
        });
    };

    const handleLogout = () => {
        setIsLoggingOut(true);
        router.post(route('logout'), {}, {
            onFinish: () => setIsLoggingOut(false),
        });
    };

    const roleName = {
        superadmin: 'Super Admin',
        admin: 'Admin',
        mahasiswa: 'Mahasiswa',
    }[user.role] || 'User';

    const userInitials = user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('');

    const mainNav = [
        {
            name: 'Dashboard',
            href: route('dashboard'),
            active: route().current('dashboard'),
            icon: <LayoutDashboard className="h-5 w-5" />,
        },
        ...(user.role === 'superadmin' ? [
            {
                name: 'Jurusan',
                href: route('admin.jurusan.index'),
                active: route().current('admin.jurusan.*'),
                icon: <Building2 className="h-5 w-5" />,
            },
            {
                name: 'Program Studi',
                href: route('admin.program-studi.index'),
                active: route().current('admin.program-studi.*'),
                icon: <GraduationCap className="h-5 w-5" />,
            },
            {
                name: 'Pengguna',
                href: route('admin.users.index'),
                active: route().current('admin.users.*'),
                icon: <Users className="h-5 w-5" />,
            },
            {
                name: 'Layanan',
                href: route('admin.layanan.index'),
                active: route().current('admin.layanan.*'),
                icon: <Layers className="h-5 w-5" />,
            },
            {
                name: 'Klien SSO',
                href: route('admin.sso-clients.index'),
                active: route().current('admin.sso-clients.*'),
                icon: <KeyRound className="h-5 w-5" />,
            },
            {
                name: 'Audit Log',
                href: route('admin.audit-logs.index'),
                active: route().current('admin.audit-logs.*'),
                icon: <ShieldAlert className="h-5 w-5" />,
            },
        ] : user.role === 'admin' ? [
            {
                name: 'Layanan',
                href: route('admin.layanan.index'),
                active: route().current('admin.layanan.*'),
                icon: <Layers className="h-5 w-5" />,
            },
            {
                name: 'Program Studi',
                href: route('admin.program-studi.index'),
                active: route().current('admin.program-studi.*'),
                icon: <GraduationCap className="h-5 w-5" />,
            },
        ] : []),
    ];

    const sharedLayanan = ((usePage().props as any).tautanLayanan || []) as Array<{ id: number; nama_layanan: string; url: string }>;
    const categoryNav = sharedLayanan.length > 0
        ? sharedLayanan.map((l) => ({
            name: l.nama_layanan,
            href: l.url,
            target: '_blank',
        }))
        : [
            {
                name: 'Akademik (SIAKAD)',
                href: 'https://siakad.ung.ac.id',
                target: '_blank',
            },
            {
                name: 'SPADA Daring (LMS)',
                href: 'https://spada.ung.ac.id',
                target: '_blank',
            },
            {
                name: 'e-Office UNG',
                href: 'https://e-office.ung.ac.id',
                target: '_blank',
            },
            {
                name: 'Perpustakaan Digital',
                href: 'https://perpus.ung.ac.id',
                target: '_blank',
            },
        ];

    const renderSidebar = (isCollapsed: boolean) => (
        <div className={`flex h-full flex-col justify-between bg-white dark:bg-slate-900 ${isCollapsed ? 'px-2 py-5' : 'px-4 py-5'} select-none`}>
            <div className="space-y-6">
                {isCollapsed ? (
                    <div className="flex justify-center py-1">
                        <button
                            type="button"
                            onClick={toggleSidebarCollapsed}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50/70 hover:text-[#9e1a1a] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-rose-400 transition-colors duration-200 ease-in-out"
                            title="Perluas Sidebar"
                        >
                            <PanelLeftOpen className="h-5 w-5 transition-colors duration-200 ease-in-out" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between px-2 py-1">
                        <Link href={route('dashboard')} className="block">
                            <img
                                src="/img/logo-web-dark.png"
                                alt="NEO SSO UNG"
                                className="h-9 w-auto object-contain select-none dark:hidden"
                            />
                            <img
                                src="/img/logo-web-white.png"
                                alt="NEO SSO UNG"
                                className="h-9 w-auto object-contain select-none hidden dark:block"
                            />
                        </Link>
                        <button
                            type="button"
                            onClick={toggleSidebarCollapsed}
                            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50/70 hover:text-[#9e1a1a] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-rose-400 transition-colors duration-200 ease-in-out"
                            title="Kecilkan Sidebar"
                        >
                            <PanelLeftClose className="h-5 w-5 transition-colors duration-200 ease-in-out" />
                        </button>
                    </div>
                )}

                {mainNav.length > 0 && (
                    <div>
                        {!isCollapsed && (
                            <p className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Navigasi</p>
                        )}
                        <nav className={`mt-2 ${isCollapsed ? 'space-y-2' : 'space-y-1'}`}>
                            {mainNav.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    title={isCollapsed ? item.name : undefined}
                                    className={`group flex items-center ${isCollapsed
                                        ? 'justify-center h-10 w-10 mx-auto'
                                        : 'justify-between px-3 py-2.5'
                                        } rounded-lg text-sm font-medium transition-colors duration-200 ease-in-out ${item.active
                                            ? 'bg-[#9e1a1a] text-white shadow-sm'
                                            : 'text-slate-600 hover:bg-rose-50/70 hover:text-[#9e1a1a] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-rose-400'
                                        }`}
                                >
                                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                                        <span className={`transition-colors duration-200 ease-in-out ${item.active ? 'text-white' : 'text-slate-400 group-hover:text-[#9e1a1a] dark:group-hover:text-rose-400'}`}>
                                            {item.icon}
                                        </span>
                                        {!isCollapsed && (
                                            <span className="transition-colors duration-200 ease-in-out">{item.name}</span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </nav>
                    </div>
                )}

                {!isCollapsed && (
                    <div>
                        <p className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Tautan Cepat</p>
                        <div className="mt-2 space-y-1">
                            {categoryNav.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    target={item.target}
                                    rel="noreferrer"
                                    className="group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-rose-50/70 hover:text-[#9e1a1a] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-rose-400 transition-colors duration-200 ease-in-out"
                                >
                                    <span className="truncate max-w-[190px] transition-colors duration-200 ease-in-out">{item.name}</span>
                                    <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#9e1a1a] dark:text-slate-500 dark:group-hover:text-rose-400 transition-colors duration-200 ease-in-out shrink-0" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
                <Link
                    href="/"
                    title={isCollapsed ? 'Beranda' : undefined}
                    className={`group flex items-center ${isCollapsed
                        ? 'justify-center h-10 w-10 mx-auto'
                        : 'justify-between px-3 py-2.5'
                        } rounded-lg text-sm font-medium text-slate-600 hover:bg-rose-50/70 hover:text-[#9e1a1a] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-rose-400 transition-colors duration-200 ease-in-out`}
                >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                        <span className="text-slate-400 group-hover:text-[#9e1a1a] dark:group-hover:text-rose-400 transition-colors duration-200 ease-in-out">
                            <Home className="h-5 w-5" />
                        </span>
                        {!isCollapsed && (
                            <span className="transition-colors duration-200 ease-in-out">Beranda</span>
                        )}
                    </div>
                    {!isCollapsed && (
                        <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-[#9e1a1a] dark:group-hover:text-rose-400 transition-colors duration-200 ease-in-out" />
                    )}
                </Link>

                {!isCollapsed && (
                    <div className="px-3 pt-0.5">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                            Universitas Negeri Gorontalo
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen w-full max-w-full bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased flex overflow-x-hidden">
            <aside className={`hidden lg:fixed lg:inset-y-0 lg:flex ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'} lg:flex-col lg:border-r lg:border-slate-200/80 dark:lg:border-slate-800 lg:bg-white dark:lg:bg-slate-900 z-40 transition-all duration-300 ease-in-out`}>
                {renderSidebar(sidebarCollapsed)}
            </aside>

            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white dark:bg-slate-900 shadow-2xl">
                        <div className="absolute right-2 top-2">
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(false)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors duration-200 ease-in-out"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        {renderSidebar(false)}
                    </div>
                </div>
            )}

            <div className={`flex flex-1 flex-col min-w-0 w-full max-w-full ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'} transition-all duration-300 ease-in-out`}>
                <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 sm:px-8 backdrop-blur-md">
                    <div className="flex items-center gap-3 flex-1 max-w-xl">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 ease-in-out lg:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <div ref={searchContainerRef} className="relative w-full">
                            <form onSubmit={handleSearchSubmit} className="relative w-full">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                    <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                </div>
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => {
                                        if (searchQuery.trim().length > 0) {
                                            setSearchOpen(true);
                                        }
                                    }}
                                    onKeyDown={handleSearchKeyDown}
                                    placeholder="Cari layanan..."
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 py-2.5 pl-10 pr-9 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors duration-200 ease-in-out focus:border-[#9e1a1a] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e1a1a]/20"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSearchResults([]);
                                            setSearchOpen(false);
                                            searchInputRef.current?.focus();
                                        }}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-150"
                                        title="Hapus"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </form>

                            {searchOpen && searchQuery.trim().length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
                                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/70">
                                        <div className="flex items-center gap-2 font-medium">
                                            <span>Hasil Pencarian</span>
                                            {!isSearching && (
                                                <span className="rounded-full bg-slate-200/70 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                                    {searchResults.length}
                                                </span>
                                            )}
                                        </div>
                                        {isSearching && (
                                            <div className="flex items-center gap-1.5 text-[11px] text-[#9e1a1a]">
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                <span>Mencari...</span>
                                            </div>
                                        )}
                                    </div>

                                    {isSearching && searchResults.length === 0 ? (
                                        <div className="py-8 text-center">
                                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/40 text-[#9e1a1a] mb-2">
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            </div>
                                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Mencari layanan...</p>
                                        </div>
                                    ) : !isSearching && searchResults.length === 0 ? (
                                        <div className="py-8 px-4 text-center">
                                            <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                                                <Search className="h-5 w-5" />
                                            </div>
                                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Layanan tidak ditemukan</p>
                                            <p className="mt-1 text-[11px] text-slate-400">Tidak ada layanan yang cocok dengan kata kunci &ldquo;{searchQuery}&rdquo;</p>
                                        </div>
                                    ) : (
                                        <div className="max-h-80 overflow-y-auto p-1.5 divide-y divide-slate-100/70">
                                            {searchResults.map((item, idx) => {
                                                const isSelected = selectedIndex === idx;
                                                return (
                                                    <div
                                                        key={item.id}
                                                        onMouseEnter={() => setSelectedIndex(idx)}
                                                        className={`group flex items-center justify-between gap-3 p-2.5 rounded-xl transition-colors duration-150 cursor-pointer ${isSelected ? 'bg-rose-50/80' : 'hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        <a
                                                            href={item.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            onClick={() => setSearchOpen(false)}
                                                            className="flex items-center gap-3 min-w-0 flex-1"
                                                        >
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
                                                                {item.icon_url ? (
                                                                    <img
                                                                        src={item.icon_url}
                                                                        alt={item.nama_layanan}
                                                                        className="h-6 w-6 object-contain"
                                                                        onError={(e) => {
                                                                            (e.target as HTMLElement).style.display = 'none';
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <span className="text-sm font-bold text-[#9e1a1a]">
                                                                        {item.nama_layanan.charAt(0).toUpperCase()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0 flex-1 text-left">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="truncate text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-[#9e1a1a] transition-colors duration-150">
                                                                        {item.nama_layanan}
                                                                    </span>
                                                                    <span className={`inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[9px] font-semibold ${item.tipe_integrasi === 'sso'
                                                                        ? 'bg-rose-50 text-[#9e1a1a] border border-rose-200/60'
                                                                        : 'bg-sky-50 text-sky-700 border border-sky-200/60'
                                                                        }`}>
                                                                        {item.tipe_integrasi === 'sso' ? 'SSO' : 'Eksternal'}
                                                                    </span>
                                                                    {!item.is_active && (
                                                                        <span className="inline-flex shrink-0 items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700 border border-amber-200/60">
                                                                            Nonaktif
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="truncate text-[11px] text-slate-400 mt-0.5">
                                                                    {item.deskripsi || item.url}
                                                                </p>
                                                            </div>
                                                        </a>

                                                        <div className="flex items-center gap-1.5 shrink-0 pl-2">
                                                            {(user.role === 'admin' || user.role === 'superadmin') && (
                                                                <Link
                                                                    href={route('admin.layanan.edit', item.slug)}
                                                                    onClick={() => setSearchOpen(false)}
                                                                    title="Edit Layanan"
                                                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-150"
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                </Link>
                                                            )}
                                                            <a
                                                                href={item.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                onClick={() => setSearchOpen(false)}
                                                                title="Buka Layanan"
                                                                className="inline-flex items-center gap-1 rounded-lg bg-[#9e1a1a] px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#831414] transition-colors duration-150"
                                                            >
                                                                <span>Buka</span>
                                                                <ExternalLink className="h-3 w-3" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 flex items-center justify-between text-xs text-slate-500">
                                        <span className="text-[11px] text-slate-400">Tekan Enter untuk melihat semua</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchOpen(false);
                                                if (user.role === 'admin' || user.role === 'superadmin') {
                                                    router.get(route('admin.layanan.index'), { q: searchQuery.trim() });
                                                } else {
                                                    router.get(route('dashboard'), { q: searchQuery.trim() });
                                                }
                                            }}
                                            className="font-semibold text-[#9e1a1a] hover:underline"
                                        >
                                            Lihat Semua Hasil
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 ml-4">
                        <ThemeToggle />
                        <div className="relative">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 sm:px-3 sm:py-1.5 transition-colors duration-200 ease-in-out hover:bg-slate-50 dark:hover:bg-slate-800"
                                    >
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                            />
                                        ) : (
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9e1a1a] text-xs font-bold text-white shadow-2xs">
                                                {userInitials}
                                            </div>
                                        )}
                                        <div className="hidden text-left sm:block">
                                            <div className="max-w-[130px] truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                                                {user.name}
                                            </div>
                                            <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                                                {roleName}
                                            </div>
                                        </div>
                                        <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content width="56">
                                    <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="h-10 w-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                                            />
                                        ) : (
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#9e1a1a] text-xs font-bold text-white shadow-xs">
                                                {userInitials}
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">{user.name}</p>
                                            <p className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">{user.email}</p>
                                            <span className="mt-1 inline-block rounded-md bg-[#9e1a1a]/10 dark:bg-rose-950/40 px-2 py-0.5 text-[10px] font-semibold text-[#9e1a1a] dark:text-rose-400">
                                                {roleName}
                                            </span>
                                        </div>
                                    </div>
                                    <Dropdown.Link href={route('profile.edit')}>
                                        Profil
                                    </Dropdown.Link>
                                    <div className="border-t border-slate-100 dark:border-slate-700"></div>
                                    <button
                                        type="button"
                                        onClick={() => setShowLogoutModal(true)}
                                        className="block w-full px-4 py-2 text-start text-sm leading-5 text-rose-600 dark:text-rose-400 transition-colors duration-200 ease-in-out hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300"
                                    >
                                        Logout
                                    </button>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </header>

                {header && (
                    <div className="border-b border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-5 sm:px-8">
                        {header}
                    </div>
                )}

                <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
                    {(usePage().props as any).flash?.success && (
                        <div className="mb-6 flex items-center justify-between rounded-lg border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300">
                            <div className="flex items-center gap-2.5">
                                <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>{(usePage().props as any).flash.success}</span>
                            </div>
                        </div>
                    )}

                    {(usePage().props as any).flash?.error && (
                        <div className="mb-6 flex items-center justify-between rounded-lg border border-rose-200 dark:border-rose-800/40 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 text-sm text-rose-800 dark:text-rose-300">
                            <div className="flex items-center gap-2.5">
                                <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
                                <span>{(usePage().props as any).flash.error}</span>
                            </div>
                        </div>
                    )}

                    {children}
                </main>
            </div>

            {/* Modal Konfirmasi Log out */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                        <div className="flex items-center gap-3.5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
                                <LogOut className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Konfirmasi Log out</h3>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            Apakah Anda yakin ingin keluar?
                        </p>
                        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                disabled={isLoggingOut}
                                onClick={() => setShowLogoutModal(false)}
                                className="rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isLoggingOut}
                                onClick={handleLogout}
                                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50 shadow-sm"
                            >
                                {isLoggingOut && (
                                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                                )}
                                <span>{isLoggingOut ? 'Log out...' : 'Log out'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

