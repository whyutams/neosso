import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    from: number | null;
    to: number | null;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

export default function Pagination({ from, to, total, links }: PaginationProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
                {from || (total > 0 ? 1 : 0)} - {to || total} dari {total}
            </p>
            <div className="flex items-center gap-1">
                {links && links.length > 0 ? (
                    links.map((link, idx) => {
                        const isPrev =
                            idx === 0 ||
                            link.label.toLowerCase().includes('prev') ||
                            link.label.includes('&laquo;') ||
                            link.label.includes('«');
                        const isNext =
                            idx === links.length - 1 ||
                            link.label.toLowerCase().includes('next') ||
                            link.label.includes('&raquo;') ||
                            link.label.includes('»');
                        const cleanLabel = link.label.replace(/&laquo;|&raquo;|«|»/g, '').trim();

                        const isArrow = isPrev || isNext;
                        const title = isPrev ? 'Sebelumnya' : isNext ? 'Berikutnya' : `Halaman ${cleanLabel}`;

                        const content = isPrev ? (
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        ) : isNext ? (
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        ) : (
                            <span>{cleanLabel}</span>
                        );

                        const baseClass = isArrow
                            ? 'inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition'
                            : 'inline-flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2.5 text-xs font-semibold transition';

                        return link.url ? (
                            <Link
                                key={idx}
                                href={link.url}
                                title={title}
                                aria-label={title}
                                className={`${baseClass} ${
                                    link.active
                                        ? 'bg-[#9e1a1a] text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {content}
                            </Link>
                        ) : (
                            <span
                                key={idx}
                                title={title}
                                aria-label={title}
                                className={`${baseClass} text-slate-300 dark:text-slate-600 cursor-not-allowed select-none`}
                            >
                                {content}
                            </span>
                        );
                    })
                ) : (
                    <span className="inline-flex h-8 min-w-[32px] items-center justify-center rounded-lg bg-[#9e1a1a] px-2.5 text-xs font-semibold text-white shadow-sm">
                        1
                    </span>
                )}
            </div>
        </div>
    );
}
