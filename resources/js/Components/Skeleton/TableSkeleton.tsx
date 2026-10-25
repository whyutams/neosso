interface TableSkeletonProps {
    rows?: number;
    cols?: number;
    columns?: number;
}

export default function TableSkeleton({ rows = 5, cols, columns }: TableSkeletonProps) {
    const totalCols = cols ?? columns ?? 5;
    return (
        <div className="w-full max-w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">
                    <thead className="border-b border-slate-200/80 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40">
                        <tr>
                            {Array.from({ length: totalCols }).map((_, i) => (
                                <th key={i} className="px-5 py-3.5">
                                    <div className="skeleton-shimmer h-3.5 w-20 rounded-md" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {Array.from({ length: rows }).map((_, rowIdx) => (
                            <tr key={rowIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                                {Array.from({ length: totalCols }).map((_, colIdx) => (
                                    <td key={colIdx} className="px-5 py-4">
                                        {colIdx === 0 ? (
                                            <div className="skeleton-shimmer h-3.5 w-6 rounded-md mx-auto" />
                                        ) : colIdx === 1 ? (
                                            <div className="flex items-center gap-3">
                                                <div className="skeleton-shimmer h-8 w-8 shrink-0 rounded-lg" />
                                                <div className="space-y-1.5 flex-1">
                                                    <div className="skeleton-shimmer h-3.5 w-32 rounded-md" />
                                                    <div className="skeleton-shimmer h-2.5 w-20 rounded-md" />
                                                </div>
                                            </div>
                                        ) : colIdx === totalCols - 1 ? (
                                            <div className="flex items-center justify-end gap-1.5">
                                                <div className="skeleton-shimmer h-7 w-7 rounded-lg" />
                                                <div className="skeleton-shimmer h-7 w-7 rounded-lg" />
                                            </div>
                                        ) : (
                                            <div
                                                className={`skeleton-shimmer h-3.5 rounded-md ${
                                                    colIdx % 2 === 0 ? 'w-24' : 'w-16'
                                                }`}
                                            />
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
