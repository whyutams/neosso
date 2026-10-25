import { useEffect, useRef, useState } from 'react';

interface Props {
    value: number;
    duration?: number;
    className?: string;
}

export default function AnimatedCounter({ value, duration = 900, className = '' }: Props) {
    const [count, setCount] = useState(0);
    const prevValueRef = useRef(0);
    const requestRef = useRef<number | null>(null);

    useEffect(() => {
        const startValue = prevValueRef.current;
        const targetValue = value ?? 0;

        if (startValue === targetValue && count === targetValue) {
            return;
        }

        const startTime = performance.now();

        // Easing perlambatan halus di akhir
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

        const updateCount = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutCubic(progress);

            const current = Math.round(startValue + (targetValue - startValue) * easedProgress);
            setCount(current);

            if (progress < 1) {
                requestRef.current = requestAnimationFrame(updateCount);
            } else {
                setCount(targetValue);
                prevValueRef.current = targetValue;
            }
        };

        requestRef.current = requestAnimationFrame(updateCount);

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [value, duration]);

    return <span className={className}>{count.toLocaleString('id-ID')}</span>;
}
