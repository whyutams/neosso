interface CardSkeletonProps {
    count?: number;
    mode?: 'list' | 'grid';
}

export default function CardSkeleton({ count = 4, mode = 'grid' }: CardSkeletonProps) {
    if (mode === 'list') {
        return (
            <div className="space-y-3">
                {Array.from({ length: count }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900"
                    >
                        <div className="flex items-center gap-3">
                            <div className="skeleton-shimmer h-10 w-10 shrink-0 rounded-xl" />
                            <div className="space-y-1.5">
                                <div className="skeleton-shimmer h-4 w-36 rounded-md" />
                                <div className="skeleton-shimmer h-3 w-48 rounded-md" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="skeleton-shimmer h-8 w-16 rounded-lg" />
                            <div className="skeleton-shimmer h-8 w-8 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4 dark:border-slate-800 dark:bg-slate-900"
                >
                    <div className="flex items-start justify-between">
                        <div className="skeleton-shimmer h-12 w-12 rounded-xl" />
                        <div className="skeleton-shimmer h-5 w-14 rounded-md" />
                    </div>
                    <div className="space-y-2">
                        <div className="skeleton-shimmer h-4 w-3/4 rounded-md" />
                        <div className="skeleton-shimmer h-3 w-full rounded-md" />
                        <div className="skeleton-shimmer h-3 w-4/5 rounded-md" />
                    </div>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="skeleton-shimmer h-4 w-16 rounded-md" />
                        <div className="skeleton-shimmer h-7 w-16 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}
