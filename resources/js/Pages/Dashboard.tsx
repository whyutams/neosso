import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AnimatedCounter from '@/Components/AnimatedCounter';
import { Deferred, Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Layers, Users, Building2, GraduationCap, ExternalLink, Pencil } from 'lucide-react';
import { Layanan } from '@/types';

interface Props {
    layanan?: Layanan[];
    stats?: {
        total_layanan: number;
        total_pengguna: number;
        total_jurusan: number;
        total_prodi: number;
    };
}

export default function Dashboard({ layanan, stats }: Props) {
    const user = usePage().props.auth.user;
    const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
    const isAdmin = user.role === 'admin' || user.role === 'superadmin';

    const kpiMetrics = [
        {
            title: 'Total Layanan',
            value: stats?.total_layanan ?? (layanan?.length || 0),
            unit: 'Layanan',
            icon: <Layers className="h-5 w-5 text-[#9e1a1a]" />,
            bgIcon: 'bg-rose-50 dark:bg-rose-950/40',
        },
        {
            title: 'Total Pengguna',
            value: stats?.total_pengguna ?? 0,
            unit: 'Akun Aktif',
            icon: <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
            bgIcon: 'bg-indigo-50 dark:bg-indigo-950/40',
        },
        {
            title: 'Total Jurusan',
            value: stats?.total_jurusan ?? 0,
            unit: 'Jurusan Terdaftar',
            icon: <Building2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
            bgIcon: 'bg-amber-50 dark:bg-amber-950/40',
        },
        {
            title: 'Total Program Studi',
            value: stats?.total_prodi ?? 0,
            unit: 'Prodi Terdaftar',
            icon: <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
            bgIcon: 'bg-emerald-50 dark:bg-emerald-950/40',
        },
    ];

    const weeklyData = [
        { label: 'Senin', count: 1240, x: 50, y: 150 },
        { label: 'Selasa', count: 1480, x: 130, y: 130 },
        { label: 'Rabu', count: 1820, x: 210, y: 100 },
        { label: 'Kamis', count: 2100, x: 300, y: 70 },
        { label: 'Jumat', count: 2350, x: 390, y: 50 },
        { label: 'Sabtu', count: 1720, x: 480, y: 110 },
        { label: 'Minggu', count: 2420, x: 550, y: 40 },
    ];

    const monthlyData = [
        { label: 'Mgg 1', count: 11200, x: 60, y: 140 },
        { label: 'Mgg 2', count: 13850, x: 180, y: 105 },
        { label: 'Mgg 3', count: 16400, x: 300, y: 75 },
        { label: 'Mgg 4', count: 19100, x: 420, y: 45 },
        { label: 'Mgg 5', count: 15720, x: 540, y: 80 },
    ];

    const weeklyPath = 'M50,150 C100,140 110,130 130,130 C170,130 190,110 210,100 C260,85 280,75 300,70 C350,60 370,55 390,50 C440,80 460,105 480,110 C510,75 530,45 550,40';
    const weeklyArea = 'M50,150 C100,140 110,130 130,130 C170,130 190,110 210,100 C260,85 280,75 300,70 C350,60 370,55 390,50 C440,80 460,105 480,110 C510,75 530,45 550,40 L550,195 L50,195 Z';

    const monthlyPath = 'M60,140 C110,125 140,115 180,105 C220,95 260,85 300,75 C340,65 380,50 420,45 C460,40 500,70 540,80';
    const monthlyArea = 'M60,140 C110,125 140,115 180,105 C220,95 260,85 300,75 C340,65 380,50 420,45 C460,40 500,70 540,80 L540,195 L60,195 Z';

    const chartData = timeframe === 'weekly' ? weeklyData : monthlyData;
    const activeIndex = hoveredPoint !== null && hoveredPoint < chartData.length ? hoveredPoint : chartData.length - 1;
    const activeChartPoint = chartData[activeIndex];

    // Deteksi titik grafik terdekat berdasarkan posisi kursor mouse secara horizontal
    const handleChartMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        if (rect.width <= 0) return;
        const mouseXRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const mouseX = mouseXRatio * 600;

        let closestIdx = 0;
        let minDistance = Infinity;
        chartData.forEach((pt, idx) => {
            const dist = Math.abs(pt.x - mouseX);
            if (dist < minDistance) {
                minDistance = dist;
                closestIdx = idx;
            }
        });

        setHoveredPoint(closestIdx);
    };

    const summaryMetrics = timeframe === 'weekly' ? {
        total: '14.820',
        growth: '+12.4% minggu ini',
        successRate: '99.8%',
        avg: '2.117',
        avgLabel: 'Rata-rata Harian',
        avgUnit: 'Akses / hari',
        responseTime: '38 ms',
    } : {
        total: '76.270',
        growth: '+18.6% bulan ini',
        successRate: '99.9%',
        avg: '15.254',
        avgLabel: 'Rata-rata Mingguan',
        avgUnit: 'Akses / minggu',
        responseTime: '35 ms',
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Panel Selamat Datang */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                    {/* Motif Karawo */}
                    <div
                        className="pointer-events-none absolute right-0 top-0 bottom-0 h-full w-36 sm:w-48 md:w-60 overflow-hidden select-none"
                        style={{
                            maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
                            WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
                        }}
                        aria-hidden="true"
                    >
                        <img
                            src="/img/karawo-red.svg"
                            alt=""
                            className="h-full w-full object-cover object-right opacity-20 sm:opacity-25 dark:opacity-15"
                        />
                    </div>

                    <div className="relative z-10 space-y-1">
                        <nav className="flex items-center text-xs">
                            <span className="font-semibold text-[#9e1a1a]">Dashboard</span>
                        </nav>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                            Dashboard
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Selamat datang kembali, {user.name}
                        </p>
                    </div>
                </div>

                {/* KPI Cards (Animasi Counter Halus) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {kpiMetrics.map((kpi, idx) => (
                        <div
                            key={idx}
                            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:shadow-md"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{kpi.title}</span>
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.bgIcon}`}>
                                    {kpi.icon}
                                </div>
                            </div>

                            <div className="mt-3">
                                <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                    <AnimatedCounter value={kpi.value} />
                                </h3>
                                <p className="mt-1 text-xs text-slate-400 font-medium">{kpi.unit}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Grid 2 Kolom: Grafik Akses di Kiri, Panel Layanan di Kanan */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Panel Grafik Aktivitas Akses Layanan */}
                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm lg:col-span-2">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-base font-bold text-slate-900 dark:text-white">Aktivitas Akses Layanan</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Frekuensi login dan autentikasi SSO {timeframe === 'weekly' ? 'per hari' : 'per minggu'}
                                </p>
                            </div>

                            <div className="flex items-center gap-1 rounded-xl bg-slate-100/80 dark:bg-slate-800 p-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTimeframe('weekly');
                                        setHoveredPoint(null);
                                    }}
                                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                                        timeframe === 'weekly'
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    Mingguan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTimeframe('monthly');
                                        setHoveredPoint(null);
                                    }}
                                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                                        timeframe === 'monthly'
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    Bulanan
                                </button>
                            </div>
                        </div>

                            <div className="relative mt-6">
                                <div className="absolute right-4 top-2 z-10 flex items-center gap-1.5 rounded-lg bg-[#9e1a1a] px-2.5 py-1 text-xs font-bold text-white shadow-md">
                                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                                    <span>{activeChartPoint.label}: {activeChartPoint.count.toLocaleString()} Akses</span>
                                </div>

                                <div
                                    className="relative h-56 w-full cursor-crosshair select-none"
                                    onMouseMove={handleChartMouseMove}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                >
                                    <svg className="h-full w-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="maroonGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#9e1a1a" stopOpacity="0.25" />
                                                <stop offset="100%" stopColor="#9e1a1a" stopOpacity="0.0" />
                                            </linearGradient>
                                        </defs>
                                        <line x1="0" y1="40" x2="600" y2="40" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="1" strokeDasharray="4 4" />
                                        <line x1="0" y1="90" x2="600" y2="90" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="1" strokeDasharray="4 4" />
                                        <line x1="0" y1="140" x2="600" y2="140" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="1" strokeDasharray="4 4" />

                                        <path
                                            d={timeframe === 'weekly' ? weeklyArea : monthlyArea}
                                            fill="url(#maroonGradient)"
                                        />
                                        <path
                                            d={timeframe === 'weekly' ? weeklyPath : monthlyPath}
                                            fill="none"
                                            stroke="#9e1a1a"
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />

                                        {/* Garis vertikal indikator di posisi active point */}
                                        <line
                                            x1={activeChartPoint.x}
                                            y1={20}
                                            x2={activeChartPoint.x}
                                            y2={195}
                                            stroke="#9e1a1a"
                                            strokeWidth="1.5"
                                            strokeDasharray="4 4"
                                            opacity="0.5"
                                        />
                                    </svg>

                                    {chartData.map((pt, idx) => {
                                        const isHovered = activeIndex === idx;
                                        return (
                                            <div
                                                key={idx}
                                                style={{
                                                    left: `${(pt.x / 600) * 100}%`,
                                                    top: `${(pt.y / 200) * 100}%`,
                                                }}
                                                className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition-all duration-200 ${
                                                    isHovered
                                                        ? 'h-4 w-4 bg-[#9e1a1a] ring-4 ring-rose-200 dark:ring-rose-900/50 shadow-md scale-125 z-20'
                                                        : 'h-3 w-3 bg-white dark:bg-slate-900 border-2 border-[#9e1a1a] z-10'
                                                }`}
                                            >
                                                {isHovered && <span className="h-1.5 w-1.5 rounded-full bg-white"></span>}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-3 flex justify-between px-6 text-[11px] font-semibold text-slate-400">
                                    {chartData.map((pt, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onMouseEnter={() => setHoveredPoint(idx)}
                                            onClick={() => setHoveredPoint(idx)}
                                            className={`transition-colors focus:outline-none ${
                                                activeIndex === idx ? 'text-[#9e1a1a] font-bold' : 'hover:text-slate-600 dark:hover:text-slate-300'
                                            }`}
                                        >
                                            {pt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-slate-800 pt-5 sm:grid-cols-4">
                            <div>
                                <p className="text-[11px] font-medium text-slate-400">Total Akses</p>
                                <p className="mt-0.5 text-base font-extrabold text-slate-800 dark:text-white">{summaryMetrics.total}</p>
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{summaryMetrics.growth}</span>
                            </div>
                            <div>
                                <p className="text-[11px] font-medium text-slate-400">Tingkat Keberhasilan</p>
                                <p className="mt-0.5 text-base font-extrabold text-slate-800 dark:text-white">{summaryMetrics.successRate}</p>
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Tinggi</span>
                            </div>
                            <div>
                                <p className="text-[11px] font-medium text-slate-400">{summaryMetrics.avgLabel}</p>
                                <p className="mt-0.5 text-base font-extrabold text-slate-800 dark:text-white">{summaryMetrics.avg}</p>
                                <span className="text-[10px] text-slate-400">{summaryMetrics.avgUnit}</span>
                            </div>
                            <div>
                                <p className="text-[11px] font-medium text-slate-400">Waktu Respon</p>
                                <p className="mt-0.5 text-base font-extrabold text-slate-800 dark:text-white">{summaryMetrics.responseTime}</p>
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Cepat</span>
                            </div>
                        </div>
                    </div>

                    {/* Panel Layanan (Berada di Samping Kanan Chart) */}
                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between lg:col-span-1">
                        <div>
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Layanan</h2>
                                    <Deferred
                                        data="layanan"
                                        fallback={<span className="h-4 w-6 rounded bg-slate-100 dark:bg-slate-800 skeleton-shimmer" />}
                                    >
                                        <span className="rounded bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 text-[11px] font-bold text-[#9e1a1a]">
                                            {layanan?.length ?? 0}
                                        </span>
                                    </Deferred>
                                </div>
                                {isAdmin && (
                                    <Link
                                        href={route('admin.layanan.index')}
                                        className="text-xs font-semibold text-[#9e1a1a] hover:underline"
                                    >
                                        Kelola
                                    </Link>
                                )}
                            </div>

                            <div className="mt-4 max-h-[380px] overflow-y-auto space-y-2.5 pr-1">
                                <Deferred
                                    data="layanan"
                                    fallback={
                                        Array.from({ length: 4 }).map((_, idx) => (
                                            <div key={idx} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="skeleton-shimmer h-10 w-10 shrink-0 rounded-xl" />
                                                    <div className="space-y-1.5">
                                                        <div className="skeleton-shimmer h-3.5 w-28 rounded-md" />
                                                        <div className="skeleton-shimmer h-2.5 w-40 rounded-md" />
                                                    </div>
                                                </div>
                                                <div className="skeleton-shimmer h-7 w-14 rounded-lg" />
                                            </div>
                                        ))
                                    }
                                >
                                    {(!layanan || layanan.length === 0) ? (
                                        <div className="py-12 text-center text-slate-400 text-xs">
                                            Belum ada layanan tersedia.
                                        </div>
                                    ) : (
                                        layanan.map((item) => {
                                            const isSso = item.tipe_integrasi === 'sso';
                                            const badgeText = isSso ? 'SSO' : 'Eksternal';

                                            return (
                                                <div
                                                    key={item.id}
                                                    className="group flex items-center justify-between gap-3 rounded-xl border border-slate-100/90 dark:border-slate-800 bg-white dark:bg-slate-800/40 p-3 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-800 transition shadow-2xs"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/40 text-[#9e1a1a] font-bold text-xs border border-rose-100/80 dark:border-rose-900/40 overflow-hidden">
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
                                                                item.nama_layanan.slice(0, 2).toUpperCase()
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white group-hover:text-[#9e1a1a] transition truncate">
                                                                    {item.nama_layanan}
                                                                </h3>
                                                                <span
                                                                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold shrink-0 ${
                                                                        isSso
                                                                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60'
                                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700'
                                                                    }`}
                                                                >
                                                                    {badgeText}
                                                                </span>
                                                            </div>
                                                            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                                                {item.deskripsi || item.url}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        {isAdmin && (
                                                            <Link
                                                                href={route('admin.layanan.edit', item.slug)}
                                                                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-2xs"
                                                                title="Edit Layanan"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </Link>
                                                        )}
                                                        <a
                                                            href={item.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1 rounded-lg bg-[#9e1a1a] px-2.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#831414]"
                                                        >
                                                            <span>Buka</span>
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </Deferred>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <Deferred
                                data="layanan"
                                fallback={<span className="text-[11px] text-slate-400">Memuat info layanan...</span>}
                            >
                                <span className="text-[11px] text-slate-400">Total {layanan?.length ?? 0} Layanan Terhubung</span>
                            </Deferred>
                            {isAdmin && (
                                <Link
                                    href={route('admin.layanan.create')}
                                    className="font-semibold text-[#9e1a1a] hover:underline text-xs"
                                >
                                    Tambah Layanan
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
